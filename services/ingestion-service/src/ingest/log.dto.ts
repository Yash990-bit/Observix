import { IsString, IsNotEmpty, IsIn, IsNumber, IsOptional } from 'class-validator';

export class IngestLogDto {
  @IsString()
  @IsNotEmpty({ message: 'service must not be empty' })
  service!: string;

  @IsString()
  @IsIn(['info', 'warn', 'error'], { message: 'level must be one of info, warn, error' })
  level!: 'info' | 'warn' | 'error';

  @IsString()
  @IsNotEmpty({ message: 'message must not be empty' })
  message!: string;

  @IsNumber({}, { message: 'timestamp must be a valid number' })
  timestamp!: number;

  @IsString()
  @IsOptional()
  trace_id?: string;

  @IsString()
  @IsOptional()
  correlation_id?: string;

  @IsString()
  @IsOptional()
  deployment_version?: string;

  @IsString()
  @IsOptional()
  host?: string;

  @IsString()
  @IsOptional()
  org_id?: string;

  @IsString()
  @IsOptional()
  project_id?: string;
}
