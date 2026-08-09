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
  private readonly authDisabled = process.env.KEYCLOAK_AUTH_DISABLED === 'true';
  private readonly issuerUrl = process.env.KEYCLOAK_ISSUER_URL;
  private readonly clientId = process.env.KEYCLOAK_CLIENT_ID;
  private readonly edgeRolePrefix = process.env.KEYCLOAK_EDGE_ROLE_PREFIX || 'drill-edge-';
  private readonly adminRoles = (process.env.KEYCLOAK_ADMIN_ROLES || 'drill-admin,admin')
    .split(',')
    .map((role) => role.trim())
    .filter(Boolean);

  private readonly jwks = this.issuerUrl
    ? createRemoteJWKSet(new URL(`${this.issuerUrl}/protocol/openid-connect/certs`))
    : null;

  isEnabled(): boolean {
    return !this.authDisabled;
  }

  createSystemUser(): AuthUser {
    return {
      subject: 'local-auth-disabled',
      username: null,
      allowedEdges: ['*'],
      isAdmin: true,
    };
  }

  async verify(token: string): Promise<AuthUser> {
    if (this.authDisabled) {
      return this.createSystemUser();
    }

    if (!this.issuerUrl || !this.jwks) {
      throw new UnauthorizedException('Keycloak auth is not configured.');
    }

    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.issuerUrl,
      });

      const keycloakPayload = payload as KeycloakPayload;
      if (this.clientId && keycloakPayload.azp !== this.clientId) {
        throw new UnauthorizedException('Invalid token client.');
      }

      const roles = this.getRoles(keycloakPayload);
      const allowedEdges = this.getAllowedEdgesFromRoles(roles);
      const isAdmin = roles.some((role) => this.adminRoles.includes(role)) || allowedEdges.includes('*');

      return {
        subject: keycloakPayload.sub ?? '',
        username: keycloakPayload.preferred_username ?? null,
        allowedEdges,
        isAdmin,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid or expired access token.');
    }
  }

  canAccessEdge(user: AuthUser, edge: string): boolean {
    return user.isAdmin || user.allowedEdges.includes('*') || user.allowedEdges.includes(edge);
  }

  private getAllowedEdgesFromRoles(roles: string[]): string[] {
    return roles
      .filter((role) => role.startsWith(this.edgeRolePrefix))
      .map((role) => role.slice(this.edgeRolePrefix.length).trim())
      .filter(Boolean);
  }

  private getRoles(payload: KeycloakPayload): string[] {
    const realmRoles = payload.realm_access?.roles ?? [];
    const resourceRoles = Object.values(payload.resource_access ?? {}).flatMap((access) => access.roles ?? []);

    return [...realmRoles, ...resourceRoles];
  }
}
