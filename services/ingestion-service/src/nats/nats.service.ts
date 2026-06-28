import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, NatsConnection, JetStreamClient, JetStreamManager, RetentionPolicy, DiscardPolicy } from 'nats';

@Injectable()
export class NatsService implements OnModuleInit, OnModuleDestroy {
  private nc?: NatsConnection;
  private js?: JetStreamClient;
  private readonly logger = new Logger(NatsService.name);
  private isConnected = false;
  private retryQueue: { subject: string; data: any; retries: number }[] = [];
  private isRetrying = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    if (this.nc) {
      await this.nc.close();
      this.logger.log('NATS connection closed');
    }
  }

  private async connectWithRetry() {
    const natsUrl = this.configService.get<string>('NATS_URL')!;
    let retries = 5;

    while (retries > 0) {
      try {
        this.nc = await connect({ servers: natsUrl });
        this.js = this.nc.jetstream();
        this.isConnected = true;
        this.logger.log(`NATS connected successfully to ${natsUrl}`);
        
        // Assert stream exists and is configured
        await this.assertStream();

        // Process any queued messages
        await this.flushRetryQueue();
        break;
      } catch (err) {
        this.logger.error(`NATS connection failed: ${(err as Error).message}. Retrying in 3 seconds...`);
        retries--;
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    if (!this.isConnected) {
      this.logger.error('NATS connection failed permanently. Local queuing active.');
    }
  }

  private async assertStream() {
    if (!this.nc) return;
    try {
      const jsm: JetStreamManager = await this.nc.jetstreamManager();
      const streamName = 'LOG_STREAM';
      const subjects = ['logs.ingest', 'logs.ingest.>', 'logs.processed', 'logs.error', 'logs.dlq'];

      // Check if stream exists
      const streams = await jsm.streams.list().next();
      const streamInfo = streams.find(s => s.config.name === streamName);

      if (!streamInfo) {
        await jsm.streams.add({
          name: streamName,
          subjects: subjects,
          retention: RetentionPolicy.Limits,
          max_msgs: -1,
          max_bytes: -1,
          discard: DiscardPolicy.Old,
        });
        this.logger.log(`NATS JetStream '${streamName}' created with multi-tenant subjects.`);
      } else {
        await jsm.streams.update(streamName, {
          ...streamInfo.config,
          subjects: Array.from(new Set([...streamInfo.config.subjects, ...subjects])),
        });
        this.logger.log(`NATS JetStream '${streamName}' updated with multi-tenant subjects.`);
      }
    } catch (err) {
      this.logger.error(`Failed to assert NATS stream: ${(err as Error).message}`);
    }
  }

  async publish(subject: string, data: any) {
    const payload = JSON.stringify(data);
    const msgData = new TextEncoder().encode(payload);

    if (!this.isConnected || !this.js) {
      this.logger.warn(`NATS not connected. Queued message on ${subject}`);
      this.queueMessage(subject, data);
      this.triggerReconnect();
      return;
    }

    try {
      const ack = await this.js.publish(subject, msgData);
      this.logger.log(`Log published to NATS: Subject=${subject}, Stream=${ack.stream}, Seq=${ack.seq}`);
    } catch (err) {
      this.logger.error(`Failed to publish message: ${(err as Error).message}. Queued.`);
      this.queueMessage(subject, data);
      this.isConnected = false;
      this.triggerReconnect();
    }
  }

  private queueMessage(subject: string, data: any) {
    this.retryQueue.push({ subject, data, retries: 0 });
    if (this.retryQueue.length > 5000) {
      this.retryQueue.shift();
      this.logger.warn('Retry queue limit reached. Evicted oldest message.');
    }
  }

  private triggerReconnect() {
    if (this.isRetrying) return;
    this.isRetrying = true;
    this.connectWithRetry().finally(() => {
      this.isRetrying = false;
    });
  }

  private async flushRetryQueue() {
    if (this.retryQueue.length === 0) return;
    this.logger.log(`Flushing ${this.retryQueue.length} queued messages to NATS`);
    const queue = [...this.retryQueue];
    this.retryQueue = [];

    for (const item of queue) {
      await this.publish(item.subject, item.data);
    }
  }
}
