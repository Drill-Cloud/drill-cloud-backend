import { Global, Module } from '@nestjs/common';
import { EdgeAccessGuard } from './edge-access.guard';
import { KeycloakAuthGuard } from './keycloak-auth.guard';
import { KeycloakAuthService } from './keycloak-auth.service';

@Global()
@Module({
  providers: [KeycloakAuthService, KeycloakAuthGuard, EdgeAccessGuard],
  exports: [KeycloakAuthService, KeycloakAuthGuard, EdgeAccessGuard],
})
export class AuthModule {}
