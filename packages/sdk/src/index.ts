export interface AegisClientOptions {
  apiKey?: string;
  orgId?: string;
  projectId?: string;
  serviceName: string;
  endpoint?: string;
  environment?: string;
  flushIntervalMs?: number;
}

export class AegisClient {
  private options: Required<AegisClientOptions>;
  private buffer: any[] = [];
  private flushTimer?: any;

  constructor(options: AegisClientOptions) {
    this.options = {
      apiKey: options.apiKey || 'default_key',
      orgId: options.orgId || 'org_default',
      projectId: options.projectId || 'proj_default',
      serviceName: options.serviceName,
      endpoint: options.endpoint || 'http://localhost:3006/logs/ingest',
      environment: options.environment || 'production',
      flushIntervalMs: options.flushIntervalMs || 2000,
    };
  }

  info(message: string, meta: Record<string, any> = {}) {
    this.log('info', message, meta);
  }

  warn(message: string, meta: Record<string, any> = {}) {
    this.log('warn', message, meta);
  }

  error(message: string, meta: Record<string, any> = {}) {
    this.log('error', message, meta);
  }

  private log(level: 'info' | 'warn' | 'error', message: string, meta: Record<string, any> = {}) {
    const payload = {
      service: this.options.serviceName,
      level,
      message,
      timestamp: Date.now(),
      org_id: this.options.orgId,
      project_id: this.options.projectId,
      trace_id: meta.trace_id || meta.traceId,
      correlation_id: meta.correlation_id || meta.correlationId,
      deployment_version: meta.deployment_version || 'v1.0.0',
      host: meta.host || 'node-server',
    };

    this.buffer.push(payload);

    if (this.buffer.length >= 50) {
      this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), this.options.flushIntervalMs);
    }
  }

  async flush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = undefined;
    }

    if (this.buffer.length === 0) return;

    const logsToSend = [...this.buffer];
    this.buffer = [];

    for (const item of logsToSend) {
      try {
        await fetch(this.options.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.options.apiKey,
            'x-org-id': this.options.orgId,
            'x-project-id': this.options.projectId,
          },
          body: JSON.stringify(item),
        });
      } catch (err) {
        // Silently preserve resilience in client app
      }
    }
  }
}
