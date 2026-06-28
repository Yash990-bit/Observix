import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsObject } from 'class-validator';

export class AnalyzeIncidentRawDto {
  @IsString()
  @IsNotEmpty()
  incident_window!: string;

  @IsString()
  @IsNotEmpty()
  service!: string;

  @IsArray()
  logs!: any[];

  @IsObject()
  @IsOptional()
  metrics?: {
    cpu?: number;
    memory?: number;
    latency?: number;
  };

  @IsArray()
  @IsOptional()
  related_services?: string[];

  @IsArray()
  @IsOptional()
  deployment_history?: any[];
}

export class AnalyzeIncidentDto {
  @IsString()
  @IsNotEmpty()
  service!: string;

  @IsNumber()
  timestamp!: number;

  @IsNumber()
  @IsOptional()
  window_minutes?: number;

  @IsArray()
  @IsOptional()
  related_services?: string[];

  @IsArray()
  @IsOptional()
  deployment_history?: any[];

  @IsObject()
  @IsOptional()
  metrics?: {
    cpu?: number;
    memory?: number;
    latency?: number;
  };
}
