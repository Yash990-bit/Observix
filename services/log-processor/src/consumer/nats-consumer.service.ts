import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, NatsConnection, JetStreamClient, JetStreamManager, AckPolicy } from 'nats';
import { LogBatcher } from '../batch/log-batcher';

@Injectable()
export class NatsConsumerService implements OnModuleInit, OnModuleDestroy {
  private nc?: NatsConnection;
  private js?: JetStreamClient;
  private readonly logger = new Logger(NatsConsumerService.name);
  private isConnected = false;
  private consumeLoopActive = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly logBatcher: LogBatcher,
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
      const consumerName = 'log-processor-consumer';

      // Verify stream exists first
      const streams = await jsm.streams.list().next();
      const streamExists = streams.some(s => s.config.name === streamName);

      if (!streamExists) {
        this.logger.warn(`Stream '${streamName}' does not exist yet. Consumer assertion deferred.`);
        throw new Error(`Stream ${streamName} not found`);
      }

      // Assert or update durable pull consumer
      try {
        await jsm.consumers.add(streamName, {
          durable_name: consumerName,
          ack_policy: AckPolicy.Explicit,
          ack_wait: 30 * 1000 * 1000 * 1000, // 30 seconds in nanoseconds
          filter_subject: 'logs.ingest.>',
        });
      } catch (e) {
        // Fallback or update if consumer already exists
      }
      this.logger.log(`NATS Durable Consumer '${consumerName}' asserted on stream '${streamName}'.`);
    } catch (err) {
      this.logger.error(`Failed to assert NATS consumer: ${(err as Error).message}`);
      throw err;
    }
  }

  private async startConsumeLoop() {
    if (!this.js || this.consumeLoopActive) return;
    this.consumeLoopActive = true;
    const consumerName = 'log-processor-consumer';
    const streamName = 'LOG_STREAM';

    this.logger.log('Starting NATS JetStream consume loop...');

    try {
      const consumer = await this.js.consumers.get(streamName, consumerName);
      const messages = await consumer.consume();
      
      for await (const msg of messages) {
        if (!this.consumeLoopActive) break;
        try {
          const payload = new TextDecoder().decode(msg.data);
          const logData = JSON.parse(payload);
          
          await this.logBatcher.add(logData, msg);
        } catch (err) {
          this.logger.error(`Failed to process message: ${(err as Error).message}`);
          msg.nak(); // Negative acknowledgement triggers immediate redelivery
        }
      }
    } catch (err) {
      this.logger.error(`NATS Consume loop crashed: ${(err as Error).message}. Restarting loop in 5 seconds...`);
      this.consumeLoopActive = false;
      await new Promise(resolve => setTimeout(resolve, 5000));
      this.connectAndStartConsume();
    }
  }
}
