import { BadRequestException, Injectable } from '@nestjs/common';
import type { UpdateUiSettingsDto } from './dto/update-ui-settings.dto';
import { UiSettingsRepository } from './ui-settings.repository';
import type { UiSettingsResponse } from './ui-settings.types';

@Injectable()
export class UiSettingsService {
  constructor(private readonly repository: UiSettingsRepository) {}

  async get(subject: string): Promise<UiSettingsResponse> {
    const row = await this.repository.findBySubject(subject);
    return { settings: row?.settings ?? null, updatedAt: row?.updated_at ?? null };
  }

  async save(subject: string, settings: UpdateUiSettingsDto): Promise<UiSettingsResponse> {
    if (settings.player.liveBufferLatencyMinRemain > settings.player.liveBufferLatencyMaxLatency) {
      throw new BadRequestException('Player min remain must not exceed max latency.');
    }
    if (settings.player.autoCleanupMinBackwardDuration > settings.player.autoCleanupMaxBackwardDuration) {
      throw new BadRequestException('Player cleanup min duration must not exceed max duration.');
    }

    const row = await this.repository.upsert(subject, settings);
    return { settings: row.settings, updatedAt: row.updated_at };
  }

  async reset(subject: string): Promise<UiSettingsResponse> {
    await this.repository.delete(subject);
    return { settings: null, updatedAt: null };
  }
}
