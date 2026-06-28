import { Injectable, Logger } from '@nestjs/common';
import { ClickHouseService } from '../clickhouse/clickhouse.service';
import { randomUUID } from 'crypto';

@Injectable()
export class LogBatcher {
  private readonly logger = new Logger(LogBatcher.name);
  private buffer: any[] = [];
  private natsMessages: any[] = [];
  private flushTimer?: NodeJS.Timeout;
  private readonly maxBufferSize = 100;
  private readonly flushIntervalMs = 1500; // 1.5 seconds

  constructor(private readonly clickhouseService: ClickHouseService) {}

  async add(log: any, natsMsg: any) {
    // 1. Transform and enrich log payload
    const enrichedLog = this.enrichLog(log);
    
    this.buffer.push(enrichedLog);
    this.natsMessages.push(natsMsg);

    this.logger.debug(`Buffered log from service "${log.service}". Buffer size: ${this.buffer.length}`);

    // Flush immediately if buffer reaches size threshold
    if (this.buffer.length >= this.maxBufferSize) {
      this.logger.log(`Buffer reached maximum size (${this.maxBufferSize}). Triggering immediate flush.`);
      await this.flush();
      return;
    }

    // Set timer if not already active
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(async () => {
        this.logger.log(`Flush interval (${this.flushIntervalMs}ms) reached. Triggering flush.`);
        await this.flush();
      }, this.flushIntervalMs);
    }
  }

  private enrichLog(log: any) {
    const severityMap: Record<string, number> = {
      info: 1,
      warn: 5,
      error: 10,
    };
    const levelLower = (log.level || 'info').toLowerCase();
    const severityScore = severityMap[levelLower] || 1;

    return {
      ...log,
      id: randomUUID(),
      processed_timestamp: Date.now(),
      severity_score: severityScore,
    };
  }

  async flush() {
    // Clear timer
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = undefined;
    }

    if (this.buffer.length === 0) return;

    // Snapshot buffer and NATS messages, then clear them immediately to accept new logs
    const batchToInsert = [...this.buffer];
    const messagesToAck = [...this.natsMessages];
    this.buffer = [];
    this.natsMessages = [];

    const startTime = Date.now();
    let success = false;
    let attempt = 1;
    const maxAttempts = 5;
    let retryDelay = 1000;

    this.logger.log(`Starting ClickHouse batch insertion for ${batchToInsert.length} logs.`);

    while (attempt <= maxAttempts) {
      try {
        await this.clickhouseService.insertLogs(batchToInsert);
        success = true;
        break;
      } catch (err) {
        this.logger.error(
          `Failed to insert batch into ClickHouse (Attempt ${attempt}/${maxAttempts}): ${(err as Error).message}`
        );
        attempt++;
        if (attempt <= maxAttempts) {
          this.logger.log(`Retrying ClickHouse insertion in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retryDelay *= 2; // exponential backoff
        }
      }
    }

    const duration = Date.now() - startTime;

    if (success) {
      // Explicitly ack NATS JetStream messages
      for (const msg of messagesToAck) {
        msg.ack();
      }
      this.logger.log(
        JSON.stringify({
          event: 'batch_inserted',
          batch_size: batchToInsert.length,
          latency_ms: duration,
          message: `Successfully stored and acked ${batchToInsert.length} logs in ${duration}ms.`,
        })
      );
    } else {
      // ClickHouse insert failed permanently. Keep unacked to trigger redelivery.
      this.logger.error(
        JSON.stringify({
          event: 'batch_failed',
          batch_size: batchToInsert.length,
          message: `ClickHouse insertion failed permanently after ${maxAttempts} attempts. Messages will NOT be acked, triggering NATS redelivery.`,
        })
      );
    }
  }
}
