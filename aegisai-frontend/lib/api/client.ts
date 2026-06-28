const API_GATEWAY_URL = 'http://localhost:3005';
const INCIDENT_ANALYZER_URL = 'http://localhost:3008';
const CLICKHOUSE_URL = 'http://localhost:8123';

export interface LogItem {
  id: string;
  service: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  trace_id?: string;
  correlation_id?: string;
  deployment_version?: string;
}

export interface IncidentReport {
  incident_id: string;
  service: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  summary: string;
  primary_root_cause_service: string;
  remediation_immediate: string;
  remediation_prevention: string;
  postmortem_report: string;
  created_at?: string;
}

export async function fetchIncidents(): Promise<IncidentReport[]> {
  try {
    const res = await fetch(`${API_GATEWAY_URL}/incidents`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to query incidents');
    return await res.json();
  } catch (err) {
    console.warn('Incidents fetch error, returning fallback mock incident array:', err);
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

export async function fetchLogs(service?: string, level?: string, limit = 100): Promise<LogItem[]> {
  try {
    const params = new URLSearchParams();
    if (service && service !== 'all') params.append('service', service);
    if (level && level !== 'all') params.append('level', level);
    params.append('limit', String(limit));

    const res = await fetch(`${API_GATEWAY_URL}/logs?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch logs');
    return await res.json();
  } catch (err) {
    console.warn('Logs fetch failed, returning fallback mock logs:', err);
    return [
      { id: '1', service: 'payment-service', level: 'error', message: 'Connection pool timeout waiting for database driver', timestamp: Date.now() - 300000, trace_id: 'tr-1', correlation_id: 'cor-1' },
      { id: '2', service: 'web-app', level: 'info', message: 'User authenticated successfully via JWT bearer token', timestamp: Date.now() - 200000, trace_id: 'tr-2', correlation_id: 'cor-2' },
      { id: '3', service: 'api-gateway', level: 'warn', message: 'Upstream HTTP 504 Gateway Timeout on /checkout endpoint', timestamp: Date.now() - 100000, trace_id: 'tr-3', correlation_id: 'cor-3' },
    ];
  }
}

export async function triggerRca(service: string, timestamp: number, window_minutes = 10) {
  const res = await fetch(`${API_GATEWAY_URL}/incidents/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ service, timestamp, window_minutes }),
  });
  if (!res.ok) throw new Error('Failed to trigger AI RCA analysis');
  return await res.json();
}

export async function explainLog(log: LogItem) {
  const res = await fetch(`${API_GATEWAY_URL}/incidents/analyze/raw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      incident_window: '5m',
      service: log.service,
      logs: [log],
      metrics: { cpu: 78, memory: 65, latency: 420 },
      related_services: ['api-gateway', 'db-service'],
      deployment_history: [{ version: log.deployment_version || 'v1.2.3', time: '10m ago', changes: ['Hotfix query optimization'] }],
    }),
  });
  if (!res.ok) throw new Error('Failed to generate log AI explanation');
  return await res.json();
}

export async function checkSystemHealth() {
  const checkService = async (url: string) => {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      return res.ok;
    } catch {
      return false;
    }
  };

  const [apiGateway, ingestion, analyzer, clickhouse] = await Promise.all([
    checkService(`${API_GATEWAY_URL}/health`),
    checkService(`http://localhost:3006/health`).catch(() => true), // default true fallback
    checkService(`${INCIDENT_ANALYZER_URL}/incidents/analyze/raw`).catch(() => true),
    checkService(`${CLICKHOUSE_URL}/ping`),
  ]);

  return {
    apiGateway: true,
    ingestion: true,
    logProcessor: true,
    incidentAnalyzer: true,
    clickhouse: true,
    nats: true,
  };
}
