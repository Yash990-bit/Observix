import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClickHouseModule } from '../clickhouse/clickhouse.module';
import { AiModule } from '../ai/ai.module';
import { AgentsModule } from '../agents/agents.module';
import { IncidentController } from './incident.controller';
import { IncidentListenerService } from './incident-listener.service';
import { AiAgentService } from '../ai/ai-agent.service';

@Module({
  imports: [ConfigModule, ClickHouseModule, AiModule, AgentsModule],
  controllers: [IncidentController],
  providers: [IncidentListenerService, AiAgentService],
  exports: [AiAgentService],
})
export class IncidentModule {}
