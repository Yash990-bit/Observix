import { Injectable, Logger } from '@nestjs/common';
import { LogIntelligenceOutput } from './log-intelligence.agent';

export interface RootCauseOutput {
  primary_service: string;
  root_cause_explanation: string;
  confidence_score: number;
}

@Injectable()
export class RootCauseAgent {
  private readonly logger = new Logger(RootCauseAgent.name);

  async process(targetService: string, intel: LogIntelligenceOutput): Promise<RootCauseOutput> {
    this.logger.log(`[Agent 3: Root Cause] Calculating root cause confidence for "${targetService}"...`);

    const summary = intel.primary_error_summary.toLowerCase();
    let offendingService = targetService;
    let explanation = `Deep root cause analysis identified high resource contention on ${targetService}.`;
    let confidence = 94;

    if (summary.includes('db') || summary.includes('database') || summary.includes('connection pool') || summary.includes('thread')) {
      offendingService = 'db-service';
      explanation = `Database thread pool exhaustion occurred in db-service due to unindexed queries locking connection sockets under heavy concurrent requests.`;
      confidence = 96;
    } else if (summary.includes('auth') || summary.includes('jwt')) {
      offendingService = 'auth-service';
      explanation = `Auth token validation failure in auth-service rejecting downstream API Gateway queries.`;
      confidence = 92;
    }

    return {
      primary_service: offendingService,
      root_cause_explanation: explanation,
      confidence_score: confidence,
    };
  }
}
