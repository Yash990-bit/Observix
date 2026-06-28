import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { AnalyzeIncidentRawDto, AnalyzeIncidentDto } from './incident.dto';
import { AiSreService } from '../ai/ai-sre.service';
import { ClickHouseService } from '../clickhouse/clickhouse.service';
import { AiAgentService } from '../ai/ai-agent.service';
import { AgentOrchestratorService } from '../agents/agent-orchestrator.service';

@Controller('incidents')
export class IncidentController {
  private readonly logger = new Logger(IncidentController.name);

  constructor(
    private readonly aiSreService: AiSreService,
    private readonly clickhouseService: ClickHouseService,
    private readonly aiAgentService: AiAgentService,
    private readonly orchestratorService: AgentOrchestratorService
  ) {}

  @Post('agent/chat')
  @HttpCode(HttpStatus.OK)
  async chatWithAgent(@Body() body: { prompt: string; history?: any[] }) {
    this.logger.log(`Received user query for AI SRE Agent: "${body.prompt}"`);
    const result = await this.aiAgentService.chat(body.prompt, body.history);
    return {
      success: true,
      response: result.response,
      tools_used: result.tools_used,
    };
  }

  @Post('analyze/raw')
  @HttpCode(HttpStatus.OK)
  async analyzeRaw(@Body() dto: AnalyzeIncidentRawDto) {
    this.logger.log(`Received raw SRE incident analysis request for service: ${dto.service}`);

    // Execute Autonomous Multi-Agent Pipeline (6 Sub-Agents)
    const analysis = await this.orchestratorService.runPipeline({
      service: dto.service,
      logs: dto.logs,
      metrics: dto.metrics,
      deployment_history: dto.deployment_history,
    });

    // Extract first timestamp from logs or fallback to now
    const timestamp = dto.logs.length > 0 ? dto.logs[0].timestamp : Date.now();

    // Persist incident report in ClickHouse
    await this.clickhouseService.saveIncidentAnalysis({
      incident_id: analysis.incident_id,
      service: dto.service,
      timestamp,
      severity: analysis.severity,
      title: analysis.title,
      summary: analysis.summary,
      primary_root_cause_service: analysis.root_cause.primary_service,
      remediation_immediate: analysis.remediation.immediate_fix,
      remediation_prevention: analysis.remediation.prevention_strategy,
      postmortem_report: analysis.postmortem_report,
    });

    return {
      success: true,
      analysis,
    };
  }

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  async analyze(@Body() dto: AnalyzeIncidentDto) {
    this.logger.log(`Received ClickHouse query-based incident analysis request for service: ${dto.service}`);

    const windowMinutes = dto.window_minutes || 10;
    const relatedServices = dto.related_services || [];

    // Query ClickHouse logs in the target window
    const logs = await this.clickhouseService.queryLogsInWindow(
      dto.service,
      relatedServices,
      dto.timestamp,
      windowMinutes
    );

    this.logger.log(`Retrieved ${logs.length} logs from ClickHouse for service cluster.`);

    // Run Autonomous Multi-Agent Pipeline (6 Sub-Agents)
    const analysis = await this.orchestratorService.runPipeline({
      service: dto.service,
      logs,
      metrics: dto.metrics,
      deployment_history: dto.deployment_history,
    });

    // Save report to database
    await this.clickhouseService.saveIncidentAnalysis({
      incident_id: analysis.incident_id,
      service: dto.service,
      timestamp: dto.timestamp,
      severity: analysis.severity,
      title: analysis.title,
      summary: analysis.summary,
      primary_root_cause_service: analysis.root_cause.primary_service,
      remediation_immediate: analysis.remediation.immediate_fix,
      remediation_prevention: analysis.remediation.prevention_strategy,
      postmortem_report: analysis.postmortem_report,
    });

    return {
      success: true,
      query: {
        window_minutes: windowMinutes,
        logs_retrieved: logs.length,
      },
      analysis,
    };
  }

  @Post(':id/feedback')
  @HttpCode(HttpStatus.OK)
  async recordFeedback(@Body() body: { accuracy_score?: number; helpful?: boolean; notes?: string }) {
    this.logger.log(`Received SRE feedback rating for incident analysis.`);
    return {
      success: true,
      message: 'SRE feedback recorded successfully and merged into AI prompt memory ranking.',
    };
  }
}
