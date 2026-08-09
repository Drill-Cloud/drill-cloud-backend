import { Type } from 'class-transformer';
import { Equals, IsBoolean, IsIn, IsInt, IsNumber, Max, Min, ValidateNested } from 'class-validator';

const GRANULATE_VALUES = ['1 second', '5 seconds', '10 seconds', '30 seconds', '1 minute'] as const;

class PlayerUiSettingsDto {
  @IsNumber()
  @Min(1)
  @Max(120)
  liveBufferLatencyMaxLatency!: number;

  @IsNumber()
  @Min(0.5)
  @Max(60)
  liveBufferLatencyMinRemain!: number;

  @IsInt()
  @Min(64 * 1024)
  @Max(4 * 1024 * 1024)
  stashInitialSize!: number;

  @IsNumber()
  @Min(5)
  @Max(180)
  autoCleanupMaxBackwardDuration!: number;

  @IsNumber()
  @Min(1)
  @Max(120)
  autoCleanupMinBackwardDuration!: number;
}

class LiveChartUiSettingsDto {
  @IsInt()
  @Min(1)
  @Max(120)
  windowMinutes!: number;

  @IsInt()
  @Min(1_000)
  @Max(60_000)
  shiftIntervalMs!: number;

  @IsInt()
  @Min(1_000)
  @Max(60_000)
  fallbackPollingMs!: number;

  @IsIn(GRANULATE_VALUES)
  granulate!: (typeof GRANULATE_VALUES)[number];

  @IsInt()
  @Min(50)
  @Max(5_000)
  maxPointsPerTag!: number;
}

class ArchiveChartUiSettingsDto {
  @IsInt()
  @Min(1)
  @Max(24 * 365)
  defaultPeriodHours!: number;
}

class InterfaceUiSettingsDto {
  @IsBoolean()
  sidebarCollapsed!: boolean;
}

export class UpdateUiSettingsDto {
  @Equals(1)
  version!: 1;

  @ValidateNested()
  @Type(() => PlayerUiSettingsDto)
  player!: PlayerUiSettingsDto;

  @ValidateNested()
  @Type(() => LiveChartUiSettingsDto)
  liveChart!: LiveChartUiSettingsDto;

  @ValidateNested()
  @Type(() => ArchiveChartUiSettingsDto)
  archiveChart!: ArchiveChartUiSettingsDto;

  @ValidateNested()
  @Type(() => InterfaceUiSettingsDto)
  interface!: InterfaceUiSettingsDto;
}

