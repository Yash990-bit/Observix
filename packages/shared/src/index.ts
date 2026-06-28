export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

export const SERVICES = {
  API_GATEWAY: 'api-gateway',
  INGESTION_SERVICE: 'ingestion-service',
} as const;

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  services: {
    postgres: boolean;
    redis: boolean;
    clickhouse: boolean;
    nats: boolean;
  };
}

export interface ITenantContext {
  org_id: string;
  project_id: string;
}

export interface ITelemetryLog extends ITenantContext {
  id?: string;
  service: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  trace_id?: string;
  correlation_id?: string;
  deployment_version?: string;
  host?: string;
  region?: string;
  environment?: string;
}

export const HEADER_KEYS = {
  API_KEY: 'x-api-key',
  ORG_ID: 'x-org-id',
  PROJECT_ID: 'x-project-id',
} as const;

export * from './logger.service';
