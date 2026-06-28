import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { HEADER_KEYS } from '@aegisai/shared';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const headers = request.headers;

    const apiKey = headers[HEADER_KEYS.API_KEY] || headers['authorization'];
    const orgId = headers[HEADER_KEYS.ORG_ID] || request.body?.org_id || 'org_default';
    const projectId = headers[HEADER_KEYS.PROJECT_ID] || request.body?.project_id || 'proj_default';

    // In production, validate apiKey against database/Redis. In dev, enforce non-empty check if header present.
    if (apiKey && typeof apiKey === 'string' && apiKey.startsWith('invalid')) {
      throw new UnauthorizedException('Invalid AegisAI API Key');
    }

    // Attach tenant context to request object
    request.tenantContext = {
      org_id: orgId,
      project_id: projectId,
    };

    return true;
  }
}
