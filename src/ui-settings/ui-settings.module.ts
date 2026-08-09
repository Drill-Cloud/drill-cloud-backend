import { Module } from '@nestjs/common';
import { UiSettingsController } from './ui-settings.controller';
import { UiSettingsRepository } from './ui-settings.repository';
import { UiSettingsService } from './ui-settings.service';

@Module({
  controllers: [UiSettingsController],
  providers: [UiSettingsService, UiSettingsRepository],
})
export class UiSettingsModule {}

