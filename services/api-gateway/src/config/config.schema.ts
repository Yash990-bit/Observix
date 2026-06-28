import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, IsUrl, validateSync, Min, Max } from 'class-validator';

export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.DEVELOPMENT;

  @IsNumber()
  @Min(1)
  @Max(65535)
  PORT: number = 3000;

  @IsString()
  DATABASE_URL!: string;

  @IsUrl({ protocols: ['redis'], require_tld: false }, { message: 'REDIS_URL must be a valid redis connection URL (e.g. redis://localhost:6379)' })
  REDIS_URL!: string;

  @IsString()
  CLICKHOUSE_HOST!: string;

  @IsString()
  CLICKHOUSE_USER!: string;

  @IsString()
  CLICKHOUSE_PASSWORD!: string;

  @IsString()
  CLICKHOUSE_DATABASE!: string;

  @IsUrl({ protocols: ['nats'], require_tld: false }, { message: 'NATS_URL must be a valid nats connection URL (e.g. nats://localhost:4222)' })
  NATS_URL!: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMsg = errors.map(err => {
      const constraints = Object.values(err.constraints || {}).join(', ');
      return `${err.property}: ${constraints}`;
    }).join(' | ');
    throw new Error(`Config validation error: ${errorMsg}`);
  }
  return validatedConfig;
}
