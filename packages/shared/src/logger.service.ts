import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class StructuredLogger implements LoggerService {
  private formatMessage(level: string, message: any, context?: string) {
    const timestamp = new Date().toISOString();
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      const logBody = typeof message === 'object' && message !== null
        ? message
        : { message };
      return JSON.stringify({
        timestamp,
        level,
        context: context || 'App',
        ...logBody,
      });
    }

    const colors: Record<string, string> = {
      info: '\x1b[32m',    // Green
      warn: '\x1b[33m',    // Yellow
      error: '\x1b[31m',   // Red
      debug: '\x1b[35m',   // Magenta
      verbose: '\x1b[36m', // Cyan
    };
    const reset = '\x1b[0m';
    const color = colors[level] || reset;
    const ctx = context ? `\x1b[33m[${context}]\x1b[0m ` : '';
    const msgStr = typeof message === 'object' && message !== null
      ? JSON.stringify(message)
      : message;
    
    return `${color}[AegisAI]${reset} - ${timestamp} ${color}${level.toUpperCase().padEnd(7)}${reset} ${ctx}${msgStr}`;
  }

  log(message: any, context?: string) {
    console.log(this.formatMessage('info', message, context));
  }

  error(message: any, trace?: string, context?: string) {
    const errorObj = typeof message === 'object' && message !== null
      ? message
      : { message };
    if (trace) {
      errorObj.stack = trace;
    }
    console.error(this.formatMessage('error', errorObj, context));
  }

  warn(message: any, context?: string) {
    console.warn(this.formatMessage('warn', message, context));
  }

  debug(message: any, context?: string) {
    console.debug(this.formatMessage('debug', message, context));
  }

  verbose(message: any, context?: string) {
    console.log(this.formatMessage('verbose', message, context));
  }
}
