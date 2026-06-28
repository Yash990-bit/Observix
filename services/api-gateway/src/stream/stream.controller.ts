import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { Observable, interval, map } from 'rxjs';
import { randomUUID } from 'crypto';

@Controller('stream')
export class StreamController {
  @Sse('logs')
  streamLogs(): Observable<MessageEvent> {
    const services = ['api-gateway', 'payment-service', 'auth-service', 'db-service', 'web-app'];
    const levels: ('info' | 'warn' | 'error')[] = ['info', 'info', 'info', 'warn', 'error'];
    const messages = [
      'GET /api/v1/users 200 OK',
      'Database connection pool acquired',
      'JWT authentication verified successfully',
      'Cache hit ratio operating at 94.2%',
      'PostgreSQL query execution time: 14ms',
      'Warning: high memory buffer allocation',
      'Error: Connection timeout reaching upstream payment provider',
      'HTTP 504 Gateway Timeout on /checkout',
    ];

    return interval(2000).pipe(
      map(() => {
        const service = services[Math.floor(Math.random() * services.length)];
        const level = levels[Math.floor(Math.random() * levels.length)];
        const message = messages[Math.floor(Math.random() * messages.length)];
        const timestamp = Date.now();

        const data = {
          id: randomUUID(),
          service,
          level,
          message: `[${service.toUpperCase()}] ${message}`,
          timestamp,
          trace_id: randomUUID(),
          correlation_id: randomUUID(),
          deployment_version: 'v1.2.3',
        };

        return { data: JSON.stringify(data) };
      })
    );
  }

  @Sse('metrics')
  streamMetrics(): Observable<MessageEvent> {
    return interval(3000).pipe(
      map(() => {
        const cpu = Math.floor(40 + Math.random() * 30);
        const memory = Math.floor(50 + Math.random() * 25);
        const logsPerSec = Math.floor(450 + Math.random() * 100);
        const healthScore = Math.floor(92 + Math.random() * 8);
        const latency = Math.floor(12 + Math.random() * 18);

        const data = {
          timestamp: Date.now(),
          cpu,
          memory,
          logsPerSec,
          healthScore,
          latency,
          activeIncidents: Math.random() > 0.7 ? 1 : 0,
        };

        return { data: JSON.stringify(data) };
      })
    );
  }

  @Sse('meta')
  streamMetaMonitoring(): Observable<MessageEvent> {
    return interval(4000).pipe(
      map(() => {
        const data = {
          timestamp: Date.now(),
          ingestionLatencyMs: Math.floor(4 + Math.random() * 8),
          clickhouseBatchLatencyMs: Math.floor(45 + Math.random() * 25),
          natsMessageLag: Math.floor(Math.random() * 5),
          aiReasoningTimeMs: Math.floor(1200 + Math.random() * 400),
          activeTenants: 12,
          dlqMessageCount: 0,
          systemStatus: 'NOMINAL',
        };

        return { data: JSON.stringify(data) };
      })
    );
  }
}
