import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IngestLogDto } from './log.dto';
import { NatsService } from '../nats/nats.service';
import { randomUUID } from 'crypto';

@Injectable()
export class IngestService {
  private readonly logger = new Logger(IngestService.name);

  constructor(
    private readonly natsService: NatsService,
    private readonly configService: ConfigService,
  ) {}

  async processLog(dto: IngestLogDto) {
    const traceId = dto.trace_id || randomUUID();
    const correlationId = dto.correlation_id || randomUUID();
    const environment = this.configService.get<string>('NODE_ENV') || 'development';
    const region = this.configService.get<string>('REGION') || 'local';
    const idempotencyKey = randomUUID();

    const orgId = dto.org_id || 'org_default';
    const projectId = dto.project_id || 'proj_default';

    const normalizedLog = {
      org_id: orgId,
      project_id: projectId,
      service: dto.service,
      level: dto.level,
      message: dto.message,
      timestamp: dto.timestamp,
      trace_id: traceId,
      correlation_id: correlationId,
      deployment_version: dto.deployment_version || 'unknown',
      host: dto.host || 'unknown',
      metadata: {
        ingestion_timestamp: Date.now(),
        environment,
        region,
        idempotency_key: idempotencyKey,
      },
    };

    // Trigger JetStream publish in a non-blocking way to tenant-isolated subject
    const subject = `logs.ingest.${orgId}.${projectId}`;
    this.natsService.publish(subject, normalizedLog).catch(err => {
      this.logger.error(`Error initiating NATS publish to ${subject}: ${err.message}`);
    });

    return {
      success: true,
      trace_id: traceId,
      correlation_id: correlationId,
      idempotency_key: idempotencyKey,
    };
  }
}
