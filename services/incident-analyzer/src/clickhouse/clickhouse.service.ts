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

    this.logger.log(`Connecting to ClickHouse at ${host} as user "${username}"`);

    this.client = createClient({
      host,
      username,
      password,
      database: 'default',
    });

    await this.initializeIncidentsTable();
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.close();
      this.logger.log('ClickHouse client closed');
    }
  }

  private async initializeIncidentsTable() {
    try {
      // Ensure database exists
      await this.client.exec({
        query: 'CREATE DATABASE IF NOT EXISTS aegisai',
      });
      this.logger.log('ClickHouse database "aegisai" asserted.');

      // Create incidents table with tenant isolation
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS aegisai.incidents (
          id UUID,
          org_id String DEFAULT 'org_default',
          project_id String DEFAULT 'proj_default',
          service String,
          timestamp DateTime,
          severity String,
          title String,
          summary String,
          primary_root_cause_service String,
          remediation_immediate String,
          remediation_prevention String,
          postmortem_report String,
          created_at DateTime
        )
        ENGINE = MergeTree
        PARTITION BY toDate(timestamp)
        ORDER BY (org_id, project_id, service, timestamp, severity)
      `;

      await this.client.exec({ query: createTableQuery });

      // Migration for existing table
      try {
        await this.client.exec({
          query: "ALTER TABLE aegisai.incidents ADD COLUMN IF NOT EXISTS org_id String DEFAULT 'org_default', ADD COLUMN IF NOT EXISTS project_id String DEFAULT 'proj_default'",
        });
      } catch (e) {}

      // Create AI incident memory table for learning engine
      const createMemoryTableQuery = `
        CREATE TABLE IF NOT EXISTS aegisai.incident_memory (
          id UUID,
          org_id String DEFAULT 'org_default',
          project_id String DEFAULT 'proj_default',
          service String,
          fingerprint String,
          title String,
          summary String,
          root_cause_explanation String,
          remediation_immediate String,
          remediation_prevention String,
          created_at DateTime
        )
        ENGINE = MergeTree
        ORDER BY (org_id, project_id, service, fingerprint)
      `;

      await this.client.exec({ query: createMemoryTableQuery });
      this.logger.log('ClickHouse tables "aegisai.incidents" and "aegisai.incident_memory" asserted.');

      try {
        const countResult = await this.client.query({
          query: "SELECT count() as cnt, (SELECT count() FROM aegisai.logs WHERE service = 'web-app') as web_app_cnt, (SELECT count() FROM aegisai.logs WHERE toUnixTimestamp(timestamp) = 1700000000) as ts_cnt FROM aegisai.logs",
          format: 'JSONEachRow',
        });
        const countJson = await countResult.json<any>();
        this.logger.log(`Logs table count diagnostics: ${JSON.stringify(countJson)}`);

        // Test identical SELECT query
        const testSel = await this.client.query({
          query: "SELECT toString(id) as id, service, level, message FROM aegisai.logs WHERE toUnixTimestamp(timestamp) >= 1699998200 AND toUnixTimestamp(timestamp) <= 1700001800 AND service = 'web-app'",
          format: 'JSONEachRow',
        });
        const testSelJson = await testSel.json<any>();
        this.logger.log(`Test select query results: ${JSON.stringify(testSelJson)}`);
      } catch (cntErr) {
        this.logger.warn(`Failed logs diagnostics on startup: ${(cntErr as Error).message}`);
      }
    } catch (err) {
      this.logger.error(`Failed to initialize ClickHouse incidents table: ${(err as Error).message}`);
    }
  }

  async queryLogsInWindow(
    service: string,
    relatedServices: string[],
    timestampMs: number,
    windowMins: number
  ): Promise<any[]> {
    try {
      const halfWindowMs = (windowMins / 2) * 60 * 1000;
      const fromTime = this.formatDateTime(timestampMs - halfWindowMs);
      const toTime = this.formatDateTime(timestampMs + halfWindowMs);

      // Escape single quotes in service names
      const serviceEscaped = service.replace(/'/g, "\\'");
      const relatedEscaped = relatedServices.map(s => `'${s.replace(/'/g, "\\'")}'`).join(',');
      
      const serviceCondition = relatedServices.length > 0
        ? `(service = '${serviceEscaped}' OR service IN (${relatedEscaped}))`
        : `service = '${serviceEscaped}'`;

      const query = `
        SELECT 
          toString(id) as id,
          service,
          level,
          message,
          toUnixTimestamp(timestamp) * 1000 as log_timestamp,
          trace_id,
          correlation_id,
          deployment_version,
          host,
          environment,
          region,
          severity_score
        FROM aegisai.logs
        WHERE toUnixTimestamp(timestamp) >= ${Math.floor((timestampMs - halfWindowMs) / 1000)}
          AND toUnixTimestamp(timestamp) <= ${Math.floor((timestampMs + halfWindowMs) / 1000)}
          AND ${serviceCondition}
        ORDER BY log_timestamp ASC
      `;

      this.logger.log(`Running ClickHouse query: ${query}`);

      const resultSet = await this.client.query({
        query,
        format: 'JSONEachRow',
      });

      const res = await resultSet.json<any>();
      this.logger.log(`Raw ClickHouse query result: ${JSON.stringify(res)}`);
      const rawRows = Array.isArray(res) ? res : (res.data || []);
      const rows = rawRows.map((r: any) => ({
        ...r,
        timestamp: Number(r.log_timestamp || r.timestamp),
      }));
      this.logger.log(`ClickHouse query parsed ${rows.length} rows.`);
      return rows;
    } catch (err) {
      this.logger.error(`Failed to query logs from ClickHouse: ${(err as Error).message}`);
      return [];
    }
  }

  async saveIncidentAnalysis(incident: {
    incident_id: string;
    service: string;
    timestamp: number;
    severity: string;
    title: string;
    summary: string;
    primary_root_cause_service: string;
    remediation_immediate: string;
    remediation_prevention: string;
    postmortem_report: string;
  }) {
    try {
      const row = {
        id: incident.incident_id,
        org_id: (incident as any).org_id || 'org_default',
        project_id: (incident as any).project_id || 'proj_default',
        service: incident.service,
        timestamp: this.formatDateTime(incident.timestamp),
        severity: incident.severity,
        title: incident.title,
        summary: incident.summary,
        primary_root_cause_service: incident.primary_root_cause_service,
        remediation_immediate: incident.remediation_immediate,
        remediation_prevention: incident.remediation_prevention,
        postmortem_report: incident.postmortem_report,
        created_at: this.formatDateTime(Date.now()),
      };

      await this.client.insert({
        table: 'aegisai.incidents',
        values: [row],
        format: 'JSONEachRow',
      });
      this.logger.log(`Incident analysis saved successfully in ClickHouse with ID: ${incident.incident_id}`);
    } catch (err) {
      this.logger.error(`Failed to save incident analysis to ClickHouse: ${(err as Error).message}`);
    }
  }

  async findMatchingMemory(service: string, orgId = 'org_default', projectId = 'proj_default'): Promise<any | null> {
    try {
      const query = `
        SELECT fingerprint, title, summary, root_cause_explanation, remediation_immediate, remediation_prevention
        FROM aegisai.incident_memory
        WHERE org_id = '${orgId}' AND project_id = '${projectId}' AND service = '${service}'
        ORDER BY created_at DESC
        LIMIT 1
      `;
      const resultSet = await this.client.query({ query, format: 'JSONEachRow' });
      const rows = await resultSet.json<any>();
      const list = Array.isArray(rows) ? rows : (rows.data || []);
      return list.length > 0 ? list[0] : null;
    } catch (err) {
      this.logger.warn(`Failed to query AI incident memory: ${(err as Error).message}`);
      return null;
    }
  }

  async saveIncidentMemory(memory: {
    id: string;
    org_id?: string;
    project_id?: string;
    service: string;
    fingerprint: string;
    title: string;
    summary: string;
    root_cause_explanation: string;
    remediation_immediate: string;
    remediation_prevention: string;
  }) {
    try {
      const row = {
        id: memory.id,
        org_id: memory.org_id || 'org_default',
        project_id: memory.project_id || 'proj_default',
        service: memory.service,
        fingerprint: memory.fingerprint,
        title: memory.title,
        summary: memory.summary,
        root_cause_explanation: memory.root_cause_explanation,
        remediation_immediate: memory.remediation_immediate,
        remediation_prevention: memory.remediation_prevention,
        created_at: this.formatDateTime(Date.now()),
      };
      await this.client.insert({
        table: 'aegisai.incident_memory',
        values: [row],
        format: 'JSONEachRow',
      });
      this.logger.log(`AI incident pattern saved into memory store for service "${memory.service}".`);
    } catch (err) {
      this.logger.error(`Failed to save incident memory pattern: ${(err as Error).message}`);
    }
  }

  private formatDateTime(epochMs: number): string {
    const date = new Date(epochMs);
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ` +
           `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;
  }
}
