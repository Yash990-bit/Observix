import { Module } from '@nestjs/common';
import { LogIntelligenceAgent } from './log-intelligence.agent';
import { IncidentDetectionAgent } from './incident-detection.agent';
import { RootCauseAgent } from './root-cause.agent';
import { DependencyCorrelationAgent } from './dependency-correlation.agent';
import { FixRecommendationAgent } from './fix-recommendation.agent';
import { FailurePredictionAgent } from './failure-prediction.agent';
import { AgentOrchestratorService } from './agent-orchestrator.service';

@Module({
  providers: [
    LogIntelligenceAgent,
    IncidentDetectionAgent,
    RootCauseAgent,
    DependencyCorrelationAgent,
    FixRecommendationAgent,
    FailurePredictionAgent,
    AgentOrchestratorService,
  ],
  exports: [AgentOrchestratorService],
})
export class AgentsModule {}
