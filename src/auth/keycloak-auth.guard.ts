import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthenticatedRequest } from './auth.types';
import { KeycloakAuthService } from './keycloak-auth.service';

@Injectable()
export class KeycloakAuthGuard implements CanActivate {
  constructor(private readonly auth: KeycloakAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!this.auth.isEnabled()) {
      request.user = this.auth.createSystemUser();
      return true;
    }

    request.user = await this.auth.verify(this.getToken(request));
    return true;
  }

  private getToken(request: Request): string {
    const header = request.headers.authorization;
    const [type, token] = header?.split(' ') ?? [];

    if (type === 'Bearer' && token) {
      return token;
    }

    const queryToken = request.query.access_token;
    if (typeof queryToken === 'string' && queryToken) {
      return queryToken;
    }

    if (Array.isArray(queryToken) && typeof queryToken[0] === 'string' && queryToken[0]) {
      return queryToken[0];
    }

    throw new UnauthorizedException('Missing Bearer token.');
  }
}
