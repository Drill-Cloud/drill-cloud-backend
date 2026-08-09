import { BadRequestException } from '@nestjs/common';
import type { UpdateUiSettingsDto } from './dto/update-ui-settings.dto';
import { UiSettingsRepository } from './ui-settings.repository';
import { UiSettingsService } from './ui-settings.service';

const settings: UpdateUiSettingsDto = {
  version: 1,
  player: {
    liveBufferLatencyMaxLatency: 24,
    liveBufferLatencyMinRemain: 8,
    stashInitialSize: 256 * 1024,
    autoCleanupMaxBackwardDuration: 20,
    autoCleanupMinBackwardDuration: 8,
  },
  liveChart: {
    windowMinutes: 25,
    shiftIntervalMs: 5_000,
    fallbackPollingMs: 1_000,
    granulate: '5 seconds',
    maxPointsPerTag: 300,
  },
  archiveChart: { defaultPeriodHours: 24 },
  interface: { sidebarCollapsed: false },
};

describe('UiSettingsService', () => {
  const repository = {
    findBySubject: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<UiSettingsRepository>;
  const service = new UiSettingsService(repository);

  beforeEach(() => jest.clearAllMocks());

  it('returns null when a user has no saved settings', async () => {
    repository.findBySubject.mockResolvedValue(null);
    await expect(service.get('user-1')).resolves.toEqual({ settings: null, updatedAt: null });
  });

  it('saves settings for the authenticated subject', async () => {
    const updatedAt = new Date('2026-08-07T10:00:00Z');
    repository.upsert.mockResolvedValue({ settings, updated_at: updatedAt });

    await expect(service.save('user-1', settings)).resolves.toEqual({ settings, updatedAt });
    expect(repository.upsert).toHaveBeenCalledWith('user-1', settings);
  });

  it('rejects inconsistent player buffer values', async () => {
    const invalid = {
      ...settings,
      player: { ...settings.player, liveBufferLatencyMinRemain: 30 },
    };

    await expect(service.save('user-1', invalid)).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.upsert).not.toHaveBeenCalled();
  });
});

