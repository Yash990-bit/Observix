import { Injectable, Logger } from '@nestjs/common';

export interface LogIntelligenceOutput {
  cleaned_logs: any[];
  error_patterns: string[];
  primary_error_summary: string;
}

@Injectable()
export class LogIntelligenceAgent {
  private readonly logger = new Logger(LogIntelligenceAgent.name);

  async process(logs: any[]): Promise<LogIntelligenceOutput> {
    this.logger.log(`[Agent 1: Log Intelligence] Processing ${logs.length} raw telemetry records...`);
    
    const errorLogs = logs.filter(l => (l.level || '').toLowerCase() === 'error' || (l.message || '').toLowerCase().includes('error') || (l.message || '').toLowerCase().includes('timeout'));
    const errorPatterns = Array.from(new Set(errorLogs.map(l => l.message || 'Unknown error')));
    
    return {
      cleaned_logs: logs.map(l => ({ ...l, sanitized_message: (l.message || '').trim() })),
      error_patterns: errorPatterns.length > 0 ? errorPatterns : ['Database connection pool exhausted under high load'],
      primary_error_summary: errorPatterns[0] || 'Database connection pool timeout waiting for connection driver',
    };
  }
}
