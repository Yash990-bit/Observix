import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, NatsConnection, JetStreamClient, JetStreamManager, AckPolicy } from 'nats';
import { AiSreService } from '../ai/ai-sre.service';
import { ClickHouseService } from '../clickhouse/clickhouse.service';

@Injectable()
export class IncidentListenerService implements OnModuleInit, OnModuleDestroy {
  private nc?: NatsConnection;
  private js?: JetStreamClient;
  private readonly logger = new Logger(IncidentListenerService.name);
  private isConnected = false;
  private consumeLoopActive = false;
  
  // Track last analysis time per service to prevent spamming
  private readonly lastAnalysisTime = new Map<string, number>();
  private readonly cooldownMs = 120 * 1000; // 2 minutes

  constructor(
    private readonly configService: ConfigService,
    private readonly aiSreService: AiSreService,
    private readonly clickhouseService: ClickHouseService,
  ) {}

  async onModuleInit() {
    await this.connectAndStartConsume();
  }

  async onModuleDestroy() {
    this.consumeLoopActive = false;
    if (this.nc) {
      await this.nc.close();
      this.logger.log('NATS connection closed');
    }
  }

  private async connectAndStartConsume() {
    const natsUrl = this.configService.get<string>('NATS_URL')!;
    let connected = false;

    while (!connected) {
      try {
        this.nc = await connect({ servers: natsUrl });
        this.js = this.nc.jetstream();
        connected = true;
        this.isConnected = true;
        this.logger.log(`NATS connected successfully to ${natsUrl}`);
        
        await this.assertConsumer();
        this.startConsumeLoop();
      } catch (err) {
        this.logger.error(`NATS connection failed: ${(err as Error).message}. Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  private async assertConsumer() {
    if (!this.nc) return;
    try {
      const jsm: JetStreamManager = await this.nc.jetstreamManager();
      const streamName = 'LOG_STREAM';
      const consumerName = 'incident-analyzer-consumer';

      // Verify stream exists first
      const streams = await jsm.streams.list().next();
      const streamExists = streams.some(s => s.config.name === streamName);

      if (!streamExists) {
        this.logger.warn(`Stream '${streamName}' does not exist yet. Consumer assertion deferred.`);
        throw new Error(`Stream ${streamName} not found`);
      }

      // Assert durable pull consumer
      await jsm.consumers.add(streamName, {
        durable_name: consumerName,
        ack_policy: AckPolicy.Explicit,
        ack_wait: 30 * 1000 * 1000 * 1000, // 30 seconds in nanoseconds
        filter_subject: 'logs.ingest',
      });
      this.logger.log(`NATS Durable Consumer '${consumerName}' asserted on stream '${streamName}'.`);
    } catch (err) {
      this.logger.error(`Failed to assert NATS consumer: ${(err as Error).message}`);
      throw err;
    }
  }

  private async startConsumeLoop() {
    if (!this.js || this.consumeLoopActive) return;
    this.consumeLoopActive = true;
    const consumerName = 'incident-analyzer-consumer';
    const streamName = 'LOG_STREAM';

    this.logger.log('Starting NATS JetStream incident observer loop...');

    try {
      const consumer = await this.js.consumers.get(streamName, consumerName);
      const messages = await consumer.consume();
      
      for await (const msg of messages) {
        if (!this.consumeLoopActive) break;
        try {
          const payload = new TextDecoder().decode(msg.data);
          const logData = JSON.parse(payload);
          
          // Check if log level is ERROR
          const level = (logData.level || '').toLowerCase();
          if (level === 'error') {
            await this.handleErrorLog(logData);
          }

          msg.ack(); // Always acknowledge immediately as we are only listening/reacting
        } catch (err) {
          this.logger.error(`Failed to process log message: ${(err as Error).message}`);
          msg.ack(); // Ack to prevent clogging the pipeline
        }
      }
    } catch (err) {
      this.logger.error(`NATS observer loop crashed: ${(err as Error).message}. Restarting loop in 5 seconds...`);
      this.consumeLoopActive = false;
      await new Promise(resolve => setTimeout(resolve, 5000));
      this.connectAndStartConsume();
    }
  }

  private async handleErrorLog(log: any) {
    const service = log.service || 'unknown';
    const now = Date.now();
    const lastTrigger = this.lastAnalysisTime.get(service);

    if (lastTrigger && (now - lastTrigger < this.cooldownMs)) {
      // Service is in cooldown period
      return;
    }

    this.lastAnalysisTime.set(service, now);
    this.logger.warn(`Autonomous SRE Brain triggered by ERROR log from service "${service}". Starting RCA...`);

    // Run async analysis after a short 3-second delay to allow logs to flush to ClickHouse
    setTimeout(async () => {
      try {
        const windowMinutes = 10;
        
        // Query ClickHouse logs in the target window
        const logs = await this.clickhouseService.queryLogsInWindow(
          service,
          [], // no related services specified for auto-trigger
          log.timestamp || now,
          windowMinutes
        );

        this.logger.log(`Autonomous query returned ${logs.length} logs for analysis.`);

        // Call AI SRE Brain
        const analysis = await this.aiSreService.analyzeIncident({
          incident_window: `${windowMinutes}m`,
          service,
          logs,
          metrics: { cpu: 80, memory: 75, latency: 1500 }, // Synthetic SRE metrics
          related_services: [],
          deployment_history: [{ version: log.deployment_version || 'unknown', time: 'Recently', changes: [] }],
        });

        this.logger.log(`Autonomous AI SRE Analysis completed: "${analysis.title}" (UUID: ${analysis.incident_id})`);

        // Save report to database
        await this.clickhouseService.saveIncidentAnalysis({
          incident_id: analysis.incident_id,
          service,
          timestamp: log.timestamp || now,
          severity: analysis.severity,
          title: analysis.title,
          summary: analysis.summary,
          primary_root_cause_service: analysis.root_cause.primary_service,
          remediation_immediate: analysis.remediation.immediate_fix,
          remediation_prevention: analysis.remediation.prevention_strategy,
          postmortem_report: analysis.postmortem_report,
        });

      } catch (err) {
        this.logger.error(`Failed during autonomous incident analysis: ${(err as Error).message}`);
      }
    }, 3000);
  }
}
