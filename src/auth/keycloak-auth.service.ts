import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { AuthUser } from './auth.types';

type KeycloakPayload = JWTPayload & {
  preferred_username?: string;
  azp?: string;
  realm_access?: {
    roles?: string[];
  };
  resource_access?: Record<string, { roles?: string[] }>;
};

@Injectable()
export class KeycloakAuthService {
  private readonly issuerUrl = process.env.KEYCLOAK_ISSUER_URL || '';
  private readonly clientId = process.env.KEYCLOAK_CLIENT_ID;
  private readonly edgeRolePrefix = process.env.KEYCLOAK_EDGE_ROLE_PREFIX || 'drill-edge-';
  private readonly adminRoles = (process.env.KEYCLOAK_ADMIN_ROLES || 'drill-admin,admin')
    .split(',')
    .map((role) => role.trim())
    .filter(Boolean);

  private readonly jwks = this.issuerUrl
    ? createRemoteJWKSet(new URL(`${this.issuerUrl}/protocol/openid-connect/certs`))
    : null;

  async verify(token: string): Promise<AuthUser> {
    if (!this.jwks) {
      throw new UnauthorizedException('Keycloak auth is not configured.');
    }

    let payload: KeycloakPayload;
    try {
      const result = await jwtVerify(token, this.jwks, {
        issuer: this.issuerUrl,
      });
      payload = result.payload as KeycloakPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token.');
    }

    if (this.clientId && payload.azp !== this.clientId) {
      throw new UnauthorizedException('Invalid token client.');
    }

    const roles = [
      ...(payload.realm_access?.roles ?? []),
      ...Object.values(payload.resource_access ?? {}).flatMap((access) => access.roles ?? []),
    ];
    const allowedEdges = roles
      .filter((role) => role.startsWith(this.edgeRolePrefix))
      .map((role) => role.slice(this.edgeRolePrefix.length).trim())
      .filter(Boolean);

    return {
      subject: payload.sub ?? '',
      username: payload.preferred_username ?? null,
      allowedEdges,
      isAdmin: allowedEdges.includes('*') || roles.some((role) => this.adminRoles.includes(role)),
    };
  }

  canAccessEdge(user: AuthUser, edge: string): boolean {
    return user.isAdmin || user.allowedEdges.includes('*') || user.allowedEdges.includes(edge);
  }
}
