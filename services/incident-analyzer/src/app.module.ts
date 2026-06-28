import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { ClickHouseModule } from './clickhouse/clickhouse.module';
import { AiModule } from './ai/ai.module';
import { IncidentModule } from './incident/incident.module';

@Module({
  imports: [ConfigModule, ClickHouseModule, AiModule, IncidentModule],
})
export class AppModule {}
