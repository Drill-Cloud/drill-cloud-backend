import type { UpdateUiSettingsDto } from './dto/update-ui-settings.dto';

export type UiSettingsRow = {
  settings: UpdateUiSettingsDto;
  updated_at: Date;
};

export type UiSettingsResponse = {
  settings: UpdateUiSettingsDto | null;
  updatedAt: Date | null;
};

