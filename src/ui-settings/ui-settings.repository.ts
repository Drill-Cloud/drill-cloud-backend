import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import type { UpdateUiSettingsDto } from './dto/update-ui-settings.dto';
import type { UiSettingsRow } from './ui-settings.types';

@Injectable()
export class UiSettingsRepository {
  constructor(private readonly db: DbService) {}

  async findBySubject(subject: string): Promise<UiSettingsRow | null> {
    const result = await this.db.query<UiSettingsRow>(
      `SELECT settings, updated_at FROM user_ui_settings WHERE user_subject = $1`,
      [subject],
    );

    return result.rows[0] ?? null;
  }

  async upsert(subject: string, settings: UpdateUiSettingsDto): Promise<UiSettingsRow> {
    const result = await this.db.query<UiSettingsRow>(
      `
        INSERT INTO user_ui_settings (user_subject, settings, version)
        VALUES ($1, $2::jsonb, $3)
        ON CONFLICT (user_subject) DO UPDATE
        SET settings = EXCLUDED.settings,
            version = EXCLUDED.version,
            updated_at = CURRENT_TIMESTAMP
        RETURNING settings, updated_at
      `,
      [subject, JSON.stringify(settings), settings.version],
    );

    return result.rows[0];
  }

  async delete(subject: string): Promise<void> {
    await this.db.query('DELETE FROM user_ui_settings WHERE user_subject = $1', [subject]);
  }
}

