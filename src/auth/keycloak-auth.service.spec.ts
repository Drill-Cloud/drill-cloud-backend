import { UnauthorizedException } from '@nestjs/common';
import { jwtVerify } from 'jose';
import { KeycloakAuthService } from './keycloak-auth.service';

jest.mock('jose', () => ({
  createRemoteJWKSet: jest.fn(() => jest.fn()),
  jwtVerify: jest.fn(),
}));

const originalEnv = { ...process.env };
const jwtVerifyMock = jwtVerify as jest.MockedFunction<typeof jwtVerify>;

afterEach(() => {
  process.env = { ...originalEnv };
  jest.clearAllMocks();
});

describe('KeycloakAuthService', () => {
  it('returns an administrator when authentication is disabled', async () => {
    process.env.KEYCLOAK_AUTH_DISABLED = 'true';

    const user = await new KeycloakAuthService().verify();

    expect(user).toEqual({
      subject: 'local-auth-disabled',
      username: null,
      allowedEdges: ['*'],
      isAdmin: true,
    });
  });

  it('requires a token when authentication is enabled', async () => {
    process.env.KEYCLOAK_AUTH_DISABLED = 'false';

    await expect(new KeycloakAuthService().verify()).rejects.toThrow(
      new UnauthorizedException('Missing Bearer token.'),
    );
  });

  it('checks access to an edge using the calculated permissions', () => {
    const service = new KeycloakAuthService();
    const user = { subject: '1', username: 'user', allowedEdges: ['edge-1'], isAdmin: false };

    expect(service.canAccessEdge(user, 'edge-1')).toBe(true);
    expect(service.canAccessEdge(user, 'edge-2')).toBe(false);
    expect(service.canAccessEdge({ ...user, isAdmin: true }, 'edge-2')).toBe(true);
  });

  it('reads edge and administrator roles from realm and client roles', async () => {
    process.env.KEYCLOAK_AUTH_DISABLED = 'false';
    process.env.KEYCLOAK_ISSUER_URL = 'https://keycloak.test/realms/drill';
    process.env.KEYCLOAK_CLIENT_ID = 'drill-ui';
    jwtVerifyMock.mockResolvedValue({
      payload: {
        sub: '1',
        azp: 'drill-ui',
        preferred_username: 'developer',
        realm_access: { roles: ['drill-admin', 'drill-edge-edge-1'] },
        resource_access: { account: { roles: ['drill-edge-edge-2'] } },
      },
      protectedHeader: { alg: 'RS256' },
      key: new Uint8Array(),
    });

    const user = await new KeycloakAuthService().verify('token');

    expect(user.allowedEdges).toEqual(['edge-1', 'edge-2']);
    expect(user.isAdmin).toBe(true);
  });
});
