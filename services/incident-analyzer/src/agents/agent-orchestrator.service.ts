import { Injectable, Logger } from '@nestjs/common';
import { LogIntelligenceAgent } from './log-intelligence.agent';
import { IncidentDetectionAgent } from './incident-detection.agent';
import { RootCauseAgent } from './root-cause.agent';
import { DependencyCorrelationAgent } from './dependency-correlation.agent';
import { FixRecommendationAgent } from './fix-recommendation.agent';
import { FailurePredictionAgent } from './failure-prediction.agent';
import { randomUUID } from 'crypto';

@Injectable()
export class AgentOrchestratorService {
  private readonly logger = new Logger(AgentOrchestratorService.name);

  constructor(
    private readonly logIntelAgent: LogIntelligenceAgent,
    private readonly detectionAgent: IncidentDetectionAgent,
    private readonly rootCauseAgent: RootCauseAgent,
    private readonly correlationAgent: DependencyCorrelationAgent,
    private readonly fixAgent: FixRecommendationAgent,
    private readonly predictionAgent: FailurePredictionAgent
  ) {}

  async runPipeline(input: {
    service: string;
    logs: any[];
    metrics?: any;
    deployment_history?: any[];
  }) {
    this.logger.log(`⚡ [Agent Orchestrator] Triggering Multi-Agent Pipeline for service "${input.service}"...`);
    const startTime = Date.now();

    // Step 1: Log Intelligence Agent
    const intel = await this.logIntelAgent.process(input.logs);

    // Step 2: Incident Detection Agent
    const detection = await this.detectionAgent.process(input.service, intel, input.metrics);

    // Step 3: Root Cause Agent
    const rootCause = await this.rootCauseAgent.process(input.service, intel);

    // Step 4 & 5 (Parallel Execution): Dependency Correlation & Fix Recommendation Agents
    const [correlation, fixes, prediction] = await Promise.all([
      this.correlationAgent.process(rootCause.primary_service, input.service),
      this.fixAgent.process(rootCause.primary_service),
      this.predictionAgent.process(input.service, intel),
    ]);

    const executionTimeMs = Date.now() - startTime;
    this.logger.log(`✔ [Agent Orchestrator] Multi-Agent Pipeline complete in ${executionTimeMs}ms across 6 specialized agents.`);

    const postmortemReport = `
# Multi-Agent SRE Report: ${detection.title}

## Multi-Agent Pipeline Execution Summary
- **Agent Orchestrator Pipeline**: \`COMPLETED (${executionTimeMs}ms)\`
- **Root Cause Confidence Score**: \`${rootCause.confidence_score}%\`
- **Predictive Early Warning Score**: \`${prediction.confidence_score}%\`

## 🧠 1. Log Intelligence Agent Output
- **Sanitized Telemetry Events Processed**: ${intel.cleaned_logs.length}
- **Detected Failure Pattern**: \`${intel.primary_error_summary}\`

## 🧠 2. Incident Detection Agent Output
- **Severity Classification**: **${detection.severity.toUpperCase()}**
- **Anomaly Window Summary**: ${detection.summary}

## 🧠 3. Root Cause Agent Output (Confidence: ${rootCause.confidence_score}%)
- **Primary Offending Service**: \`${rootCause.primary_service}\`
- **Deep Explanation**: ${rootCause.root_cause_explanation}

## 🧠 4. Dependency Correlation Agent Output (Propagation Chain)
\`\`\`text
${correlation.failure_propagation_graph.join('\n')}
\`\`\`

## 🧠 5. Fix Recommendation Agent Output
- **Immediate Workaround**: ${fixes.immediate_fix}
- **Prevention Strategy**: ${fixes.prevention_strategy}

## 🧠 6. Failure Prediction Agent Output (Proactive Prevention)
- **Early Warning Signal**: ${prediction.predicted_incident}
- **Estimated Time-to-Outage**: ${prediction.time_to_outage_minutes} minutes
    `.trim();

    return {
      incident_id: randomUUID(),
      severity: detection.severity,
      title: detection.title,
      summary: detection.summary,
      root_cause: {
        primary_service: rootCause.primary_service,
        root_cause_explanation: `${rootCause.root_cause_explanation} (Agent Confidence: ${rootCause.confidence_score}%)`,
        correlated_failures: correlation.failure_propagation_graph,
      },
      remediation: {
        immediate_fix: fixes.immediate_fix,
        prevention_strategy: fixes.prevention_strategy,
      },
      postmortem_report: postmortemReport,
      agent_metrics: {
        execution_time_ms: executionTimeMs,
        root_cause_confidence: rootCause.confidence_score,
        predictive_confidence: prediction.confidence_score,
      },
    };
  }
}
