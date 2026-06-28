import { Injectable, Logger } from '@nestjs/common';
import { LogIntelligenceOutput } from './log-intelligence.agent';

export interface IncidentDetectionOutput {
  incident_detected: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  summary: string;
}

@Injectable()
export class IncidentDetectionAgent {
  private readonly logger = new Logger(IncidentDetectionAgent.name);

  async process(targetService: string, intel: LogIntelligenceOutput, metrics?: any): Promise<IncidentDetectionOutput> {
    this.logger.log(`[Agent 2: Incident Detection] Analyzing anomaly windows for service "${targetService}"...`);

    const hasErrors = intel.error_patterns.length > 0;
    const isHighLatency = metrics?.latency && metrics.latency > 1000;
    const severity: 'low' | 'medium' | 'high' | 'critical' = isHighLatency ? 'critical' : hasErrors ? 'high' : 'medium';

    return {
      incident_detected: true,
      severity,
      title: `Automated Multi-Service Anomaly in ${targetService}`,
      summary: `Cluster telemetry anomaly detected in ${targetService}. Pattern: ${intel.primary_error_summary}`,
    };
  }
}
