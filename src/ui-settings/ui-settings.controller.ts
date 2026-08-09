import { Body, Controller, Delete, Get, Put, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest } from '../auth/auth.types';
import { KeycloakAuthGuard } from '../auth/keycloak-auth.guard';
import { UpdateUiSettingsDto } from './dto/update-ui-settings.dto';
import { UiSettingsService } from './ui-settings.service';

@Controller('me/ui-settings')
@UseGuards(KeycloakAuthGuard)
export class UiSettingsController {
  constructor(private readonly settings: UiSettingsService) {}

  @Get()
  get(@Req() request: AuthenticatedRequest) {
    return this.settings.get(request.user.subject);
  }

  @Put()
  save(@Req() request: AuthenticatedRequest, @Body() settings: UpdateUiSettingsDto) {
    return this.settings.save(request.user.subject, settings);
  }

  @Delete()
  reset(@Req() request: AuthenticatedRequest) {
    return this.settings.reset(request.user.subject);
  }
}

