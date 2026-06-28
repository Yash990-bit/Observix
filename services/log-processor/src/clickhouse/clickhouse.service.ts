import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, ClickHouseClient } from '@clickhouse/client';

@Injectable()
export class ClickHouseService implements OnModuleInit, OnModuleDestroy {
  private client!: ClickHouseClient;
  private readonly logger = new Logger(ClickHouseService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('CLICKHOUSE_HOST') || 'http://localhost:8123';
    const username = this.configService.get<string>('CLICKHOUSE_USER') || 'default';
    const password = this.configService.get<string>('CLICKHOUSE_PASSWORD') || '';

    this.client = createClient({
      host: host,
      username,
      password,
      database: 'default',
    });

    await this.initializeDatabaseSchema();
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.close();
      this.logger.log('ClickHouse client closed');
    }
  }

  private async initializeDatabaseSchema() {
    try {
      // 1. Create database aegisai
      await this.client.exec({
        query: 'CREATE DATABASE IF NOT EXISTS aegisai',
      });
      this.logger.log('ClickHouse database "aegisai" asserted.');

      // 2. Create logs table partitioned by date with tenant isolation
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS aegisai.logs (
          id UUID,
          org_id String DEFAULT 'org_default',
          project_id String DEFAULT 'proj_default',
          service String,
          level String,
          message String,
          timestamp DateTime,
          ingestion_timestamp DateTime,
          processed_timestamp DateTime,
          trace_id String,
          correlation_id String,
          deployment_version String,
          host String,
          region String,
          environment String,
          severity_score UInt8
        )
        ENGINE = MergeTree
        PARTITION BY toDate(timestamp)
        ORDER BY (org_id, project_id, service, timestamp, level)
      `;

      await this.client.exec({
        query: createTableQuery,
      });

      // Assert column migrations for existing tables
      try {
        await this.client.exec({
          query: "ALTER TABLE aegisai.logs ADD COLUMN IF NOT EXISTS org_id String DEFAULT 'org_default', ADD COLUMN IF NOT EXISTS project_id String DEFAULT 'proj_default'",
        });
      } catch (e) {
        // Ignore if already altered
      }

      this.logger.log('ClickHouse table "aegisai.logs" asserted with multi-tenant schema.');
    } catch (err) {
      this.logger.error(`Failed to initialize ClickHouse database schema: ${(err as Error).message}`);
    }
  }

  async insertLogs(logs: any[]) {
    const normalized = logs.map(log => ({
      id: log.id,
      org_id: log.org_id || 'org_default',
      project_id: log.project_id || 'proj_default',
      service: log.service,
      level: log.level,
      message: log.message,
      timestamp: this.formatDateTime(log.timestamp),
      ingestion_timestamp: this.formatDateTime(log.metadata.ingestion_timestamp),
      processed_timestamp: this.formatDateTime(log.processed_timestamp),
      trace_id: log.trace_id,
      correlation_id: log.correlation_id,
      deployment_version: log.deployment_version,
      host: log.host,
      region: log.metadata.region,
      environment: log.metadata.environment,
      severity_score: log.severity_score,
    }));

    await this.client.insert({
      table: 'aegisai.logs',
      values: normalized,
      format: 'JSONEachRow',
    });
  }

  private formatDateTime(epochMs: number): string {
    const date = new Date(epochMs);
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ` +
           `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
  }
}
