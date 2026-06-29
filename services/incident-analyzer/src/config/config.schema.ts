import { plainToInstance } from 'class-transformer';
import { IsEnum, IsString, IsUrl, IsNumber, IsOptional, validateSync } from 'class-validator';

export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.DEVELOPMENT;

  @IsNumber()
  @IsOptional()
  ANALYZER_PORT: number = 3008;

  @IsUrl({ protocols: ['nats', 'tls'], require_tld: false }, { message: 'NATS_URL must be a valid nats connection URL' })
  NATS_URL!: string;

  @IsString()
  CLICKHOUSE_HOST!: string;

  @IsString()
  CLICKHOUSE_USER!: string;

  @IsString()
  CLICKHOUSE_PASSWORD!: string;

  @IsString()
  @IsOptional()
  GEMINI_API_KEY?: string;

  @IsString()
  @IsOptional()
  GEMINI_MODEL?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    console.error('Config validation errors details:', JSON.stringify(errors, null, 2));
    const errorMsg = errors.map(err => {
      const constraints = Object.values(err.constraints || {}).join(', ');
      return `${err.property}: ${constraints}`;
    }).join(' | ');
    throw new Error(`Config validation error: ${errorMsg}`);
  }
  return validatedConfig;
}
