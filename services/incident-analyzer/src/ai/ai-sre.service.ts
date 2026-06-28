import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { randomUUID } from 'crypto';

export interface IncidentAnalysisResult {
  incident_id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  summary: string;
  root_cause: {
    primary_service: string;
    root_cause_explanation: string;
    correlated_failures: string[];
  };
  remediation: {
    immediate_fix: string;
    prevention_strategy: string;
  };
  postmortem_report: string;
}

@Injectable()
export class AiSreService implements OnModuleInit {
  private readonly logger = new Logger(AiSreService.name);
  private genAI?: GoogleGenerativeAI;
  private modelName = 'gemini-2.5-flash';

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';

    if (apiKey && apiKey !== 'mock' && apiKey !== 'placeholder' && apiKey.trim() !== '') {
      try {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.logger.log(`Gemini API client initialized successfully using model: ${this.modelName}`);
      } catch (err) {
        this.logger.error(`Failed to initialize Gemini API client: ${(err as Error).message}. Falling back to mock engine.`);
      }
    } else {
      this.logger.warn('No valid GEMINI_API_KEY found in environment. Running in offline/mock SRE mode.');
    }
  }

  async analyzeIncident(input: {
    incident_window: string;
    service: string;
    logs: any[];
    metrics?: { cpu?: number; memory?: number; latency?: number };
    related_services?: string[];
    deployment_history?: any[];
    model?: string;
  }): Promise<IncidentAnalysisResult> {
    this.logger.log(`Analyzing incident for service "${input.service}" with ${input.logs.length} logs.`);

    // Dynamic Model Selection: Upgrade to Pro model for critical incidents
    const isCritical = (input.metrics?.latency && input.metrics.latency > 1000) || input.logs.length > 30;
    const activeModel = input.model || (isCritical ? 'gemini-1.5-pro' : this.modelName);
    this.logger.log(`Dynamic Model Router selected AI Model Engine: "${activeModel}"`);

    if (this.genAI) {
      try {
        return await this.runGeminiAnalysis(input, activeModel);
      } catch (err) {
        this.logger.error(`Error during Gemini incident analysis: ${(err as Error).message}. Falling back to mock analysis.`);
        return this.generateMockAnalysis(input);
      }
    } else {
      return this.generateMockAnalysis(input);
    }
  }

  private async runGeminiAnalysis(input: any, activeModel: string): Promise<IncidentAnalysisResult> {
    const systemInstruction = `
You are a Staff-level Site Reliability Engineer (SRE) and Distributed Systems Expert.
Your task is to analyze a distributed systems incident and generate a high-quality, production-grade Root Cause Analysis (RCA) and Postmortem report.

You will receive a JSON payload representing the incident context, including raw logs, metrics, related services, and recent deployment changes.

Perform the following SRE reasoning steps:
1. Identify the trigger event and the primary service causing the failure.
2. Formulate the failure cascade chain: how did the error propagate across services (correlate using trace_id/correlation_id or temporal proximity).
3. Connect the incident to any recent deployments or configuration changes.
4. Detail the impact (affected services, metrics deviation).
5. Suggest immediate remediation steps (fixes/workarounds) and long-term prevention strategies.
6. Generate a standard, professional SRE Postmortem report in Markdown format.

Your output MUST be a single, valid JSON object matching the following structure. Do NOT add markdown blocks like \`\`\`json or text explanation outside of the JSON structure.

{
  "incident_id": "string (Generate a new UUID)",
  "severity": "low" | "medium" | "high" | "critical",
  "title": "string (Descriptive incident title)",
  "summary": "string (Short high-level description of what occurred)",
  "root_cause": {
    "primary_service": "string (offending service)",
    "root_cause_explanation": "string (deep technical explanation of the root cause)",
    "correlated_failures": ["string (cascade trace step 1)", "string (cascade trace step 2)"]
  },
  "remediation": {
    "immediate_fix": "string (mitigation fix)",
    "prevention_strategy": "string (resiliency prevention plan)"
  },
  "postmortem_report": "string (Markdown format postmortem including Timeline, Root Cause, Impact, Resolution, and Action Items)"
}
`;

    const model = this.genAI!.getGenerativeModel({
      model: activeModel,
      systemInstruction: systemInstruction,
    });

    const prompt = `
Incident Context:
${JSON.stringify(input, null, 2)}

Analyze this incident and return the structured SRE report JSON.
`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = result.response.text();
    this.logger.debug(`Gemini response received: ${responseText.substring(0, 200)}...`);

    // Parse the JSON output
    try {
      return JSON.parse(responseText.trim());
    } catch (parseErr) {
      this.logger.warn(`Failed to parse Gemini response as JSON. Attempting cleanup.`);
      // Fallback regex cleanup if model wraps in markdown
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned);
    }
  }

  private generateMockAnalysis(input: {
    incident_window: string;
    service: string;
    logs: any[];
    metrics?: { cpu?: number; memory?: number; latency?: number };
    related_services?: string[];
    deployment_history?: any[];
  }): IncidentAnalysisResult {
    const errorLogs = input.logs.filter(l => (l.level || '').toLowerCase() === 'error');
    const firstErrorMessage = errorLogs.length > 0 ? errorLogs[0].message : 'Unknown error occurred';
    const traceId = errorLogs.length > 0 ? errorLogs[0].trace_id : randomUUID();
    const correlationId = errorLogs.length > 0 ? errorLogs[0].correlation_id : randomUUID();

    // Determine target root cause service based on log messages
    let offendingService = input.service;
    let explanation = `The primary service ${input.service} experienced a surge in error rates.`;
    const logsStr = JSON.stringify(input.logs).toLowerCase();
    
    if (logsStr.includes('db-service') || logsStr.includes('postgres') || logsStr.includes('connection pool') || logsStr.includes('timeout')) {
      offendingService = 'db-service';
      explanation = `Database service pool exhaustion occurred due to unindexed queries running concurrently in the database, locking the connection pool.`;
    } else if (logsStr.includes('auth-service') || logsStr.includes('unauthorized') || logsStr.includes('jwt')) {
      offendingService = 'auth-service';
      explanation = `Auth token validation failure occurred in auth-service due to an expired keyset, rejecting API-Gateway proxy queries.`;
    }

    const severity = (input.metrics?.latency && input.metrics.latency > 1000) || errorLogs.length > 10
      ? 'critical'
      : 'high';

    const title = `Cascading Failure in ${input.service} triggered by ${offendingService}`;
    const summary = `System anomaly detected in ${input.service} (Latency: ${input.metrics?.latency || 'N/A'}ms, CPU: ${input.metrics?.cpu || 'N/A'}%) caused by backend dependencies failing.`;

    const cascadeSteps = [
      `1. Deployment of version ${input.deployment_history?.[0]?.version || 'v1.2.3'} initialized.`,
      `2. ${offendingService} experienced database connection queue timeouts under heavy query volume.`,
      `3. Dependent service ${input.service} began returning 504 Gateway errors for API consumers (Trace: ${traceId}).`,
      `4. Latency metric spiked to ${input.metrics?.latency || 1200}ms, triggering automatic SRE alert.`
    ];

    const postmortemReport = `
# SRE Postmortem: ${title}

## Incident Summary
- **Incident ID**: \`${randomUUID()}\`
- **Owner**: AegisAI SRE Brain (Offline Mode)
- **Severity**: **${severity.toUpperCase()}**
- **Trigger**: Service alert for ${input.service} latency exceeding threshold
- **Resolution**: Automatic log cluster identification and fallback activation

## Timeline (UTC)
- **11:40**: Latency metrics for \`${input.service}\` spiked to ${input.metrics?.latency || 1200}ms.
- **11:41**: Log Processor detected consecutive error logs.
- **11:43**: SRE Engine analyzed failures showing cascade trace from \`${offendingService}\`.
- **11:45**: Auto-mitigation recommendation generated.

## Root Cause Analysis
${explanation} The deployment of version \`${input.deployment_history?.[0]?.version || 'v1.0.0'}\` introduced schema updates that invalidated existing connection patterns.

## Impact
- **Primary Service**: \`${input.service}\`
- **CPU Usage**: ${input.metrics?.cpu || 85}%
- **Memory Usage**: ${input.metrics?.memory || 70}%
- **Correlated trace ID**: \`${traceId}\`
- **Correlated correlation ID**: \`${correlationId}\`

## Action Items
1. **Remediation**: Scale up connection pool limits on \`${offendingService}\` and revert deployment \`${input.deployment_history?.[0]?.version || 'v1.2.3'}\`.
2. **Prevention**: Implement circuit breaker policy in API Gateway for outbound connection proxies and add a Redis cache layer for repetitive query responses.
    `.trim();

    return {
      incident_id: randomUUID(),
      severity: severity as any,
      title,
      summary,
      root_cause: {
        primary_service: offendingService,
        root_cause_explanation: explanation,
        correlated_failures: cascadeSteps,
      },
      remediation: {
        immediate_fix: `Roll back service deployment to previous version and clear connection state cache.`,
        prevention_strategy: `Add circuit breakers on dependencies and configure connection pool limits in service settings.`,
      },
      postmortem_report: postmortemReport,
    };
  }
}
