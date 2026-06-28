import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { HealthCheckResponse } from '@aegisai/shared';

@Controller('health')
export class HealthController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  check(): HealthCheckResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        postgres: !!this.configService.get<string>('DATABASE_URL'),
        redis: !!this.configService.get<string>('REDIS_URL'),
        clickhouse: !!this.configService.get<string>('CLICKHOUSE_HOST'),
        nats: !!this.configService.get<string>('NATS_URL'),
      },
    };
  }
}
