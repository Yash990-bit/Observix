import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { createClient } from '@clickhouse/client';

@Controller()
export class ProxyController {
  private getClickHouseClient() {
    return createClient({
      host: process.env.CLICKHOUSE_HOST || 'http://localhost:8123',
      username: process.env.CLICKHOUSE_USER || 'default',
      password: process.env.CLICKHOUSE_PASSWORD || '',
      database: 'default',
    });
  }

  @Get('logs')
  async getLogs(@Query('service') service?: string, @Query('level') level?: string, @Query('limit') limit = '100') {
    try {
      const client = this.getClickHouseClient();
      let whereClause = '';
      const conditions: string[] = [];
      if (service && service !== 'all') conditions.push(`service = '${service.replace(/'/g, "\\'")}'`);
      if (level && level !== 'all') conditions.push(`level = '${level.replace(/'/g, "\\'")}'`);
      if (conditions.length > 0) whereClause = 'WHERE ' + conditions.join(' AND ');

      const query = `SELECT toString(id) as id, service, level, message, toUnixTimestamp(timestamp)*1000 as log_timestamp, trace_id, correlation_id, deployment_version FROM aegisai.logs ${whereClause} ORDER BY log_timestamp DESC LIMIT ${parseInt(limit, 10) || 100}`;
      const res = await client.query({ query, format: 'JSONEachRow' });
      const rows: any = await res.json();
      await client.close();
      const list = Array.isArray(rows) ? rows : (rows?.data || []);
      return list.map((r: any) => ({ ...r, timestamp: Number(r.log_timestamp || r.timestamp || Date.now()) }));
    } catch (err) {
      return [
        { id: '1', service: 'payment-service', level: 'error', message: 'Connection pool timeout waiting for database driver', timestamp: Date.now() - 300000, trace_id: 'tr-1' },
        { id: '2', service: 'web-app', level: 'info', message: 'User authenticated successfully via JWT bearer token', timestamp: Date.now() - 200000, trace_id: 'tr-2' },
        { id: '3', service: 'api-gateway', level: 'warn', message: 'Upstream HTTP 504 Gateway Timeout on /checkout endpoint', timestamp: Date.now() - 100000, trace_id: 'tr-3' },
      ];
    }
  }

  @Get('incidents')
  async getIncidents() {
    try {
      const client = this.getClickHouseClient();
      const query = 'SELECT id as incident_id, service, toUnixTimestamp(created_at)*1000 as created_ts, toUnixTimestamp(timestamp)*1000 as log_timestamp, severity, title, summary, primary_root_cause_service, remediation_immediate, remediation_prevention, postmortem_report, toString(created_at) as created_at FROM aegisai.incidents ORDER BY created_at DESC LIMIT 50';
      const res = await client.query({ query, format: 'JSONEachRow' });
      const rows: any = await res.json();
      await client.close();
      const list = Array.isArray(rows) ? rows : (rows?.data || []);
      return list.map((r: any) => ({ ...r, timestamp: Number(r.created_ts || r.log_timestamp || Date.now()) }));
    } catch (err) {
      return [
        {
          incident_id: 'acbc7355-f64f-4da6-b2d8-5244d3d1f892',
          service: 'payment-service',
          timestamp: Date.now() - 600000,
          severity: 'critical',
          title: 'Cascading Failure in payment-service triggered by db-service',
          summary: 'System anomaly detected in payment-service caused by database connection pool exhaustion.',
          primary_root_cause_service: 'db-service',
          remediation_immediate: 'Roll back service deployment to previous version and scale pool connections.',
          remediation_prevention: 'Add circuit breaker policy in API Gateway for outbound connection proxies.',
          postmortem_report: '# SRE Postmortem: Cascading Failure in payment-service\n\n## Incident Summary\nDatabase service pool exhaustion occurred due to unindexed queries locking connection threads.',
        },
      ];
    }
  }

  @Post('incidents/analyze')
  @HttpCode(HttpStatus.OK)
  async proxyAnalyze(@Body() body: any) {
    try {
      const res = await fetch('http://localhost:3008/incidents/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  @Post('incidents/analyze/raw')
  @HttpCode(HttpStatus.OK)
  async proxyAnalyzeRaw(@Body() body: any) {
    try {
      const res = await fetch('http://localhost:3008/incidents/analyze/raw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }

  @Get('keys')
  async getApiKeys() {
    return [
      { id: 'key_1', name: 'Production Microservices Secret', key: 'aegis_sec_live_9942a1b', created_at: '2026-06-20', status: 'ACTIVE' },
      { id: 'key_2', name: 'Staging Integration Key', key: 'aegis_sec_stg_8821c9d', created_at: '2026-06-24', status: 'ACTIVE' },
    ];
  }

  @Post('keys/generate')
  @HttpCode(HttpStatus.OK)
  async generateApiKey(@Body() body?: { name?: string }) {
    const randomHex = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6);
    const key = `aegis_sec_live_${randomHex}`;
    return {
      success: true,
      key: {
        id: `key_${Date.now()}`,
        name: body?.name || 'Developer API Key',
        key,
        created_at: new Date().toISOString().split('T')[0],
        status: 'ACTIVE',
      },
    };
  }

  @Post('agent/chat')
  @HttpCode(HttpStatus.OK)
  async proxyAgentChat(@Body() body: any) {
    try {
      const res = await fetch('http://localhost:3008/incidents/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }
}
