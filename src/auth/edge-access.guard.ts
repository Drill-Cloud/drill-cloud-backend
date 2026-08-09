import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthenticatedRequest } from './auth.types';
import { KeycloakAuthService } from './keycloak-auth.service';

@Injectable()
export class EdgeAccessGuard implements CanActivate {
  constructor(private readonly auth: KeycloakAuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const edge = this.getRequestedEdge(request);

    if (!edge || this.auth.canAccessEdge(request.user, edge)) {
      return true;
    }

    throw new ForbiddenException('Access to this edge is forbidden.');
  }

  private getRequestedEdge(request: AuthenticatedRequest): string | null {
    const queryEdge = request.query.edge;

    if (typeof queryEdge === 'string') {
      return queryEdge;
    }

    if (Array.isArray(queryEdge) && typeof queryEdge[0] === 'string') {
      return queryEdge[0];
    }

    return null;
  }
}
