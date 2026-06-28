import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private requestCounts = new Map<string, { count: number; resetTime: number }>();
  private readonly MAX_REQUESTS_PER_MINUTE = 1000;
  private readonly WINDOW_MS = 60 * 1000;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const tenantKey = request.tenantContext?.project_id || request.ip || 'global';

    const now = Date.now();
    const record = this.requestCounts.get(tenantKey);

    if (!record || now > record.resetTime) {
      this.requestCounts.set(tenantKey, { count: 1, resetTime: now + this.WINDOW_MS });
      return true;
    }

    if (record.count >= this.MAX_REQUESTS_PER_MINUTE) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Ingestion rate limit exceeded for tenant project '${tenantKey}'. Maximum ${this.MAX_REQUESTS_PER_MINUTE} req/min allowed.`,
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    record.count++;
    return true;
  }
}
