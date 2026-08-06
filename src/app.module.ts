import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CameraModule } from './camera/camera.module';
import { CurrentModule } from './current/current.module';
import { DbModule } from './db/db.module';
import { EdgeModule } from './edge/edge.module';
import { HealthController } from './health.controller';
import { HistoryModule } from './history/history.module';
import { IngestModule } from './ingest/ingest.module';
import { TagModule } from './tag/tag.module';
import { UiSettingsModule } from './ui-settings/ui-settings.module';

@Module({
  imports: [
    AuthModule,
    DbModule,
    CameraModule,
    IngestModule,
    EdgeModule,
    CurrentModule,
    HistoryModule,
    TagModule,
    UiSettingsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
