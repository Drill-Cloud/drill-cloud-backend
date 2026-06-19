import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CurrentModule } from './current/current.module';
import { DbModule } from './db/db.module';
import { EdgeModule } from './edge/edge.module';
import { HealthController } from './health.controller';
import { HistoryModule } from './history/history.module';
import { IngestModule } from './ingest/ingest.module';
import { TagModule } from './tag/tag.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    IngestModule,
    EdgeModule,
    CurrentModule,
    HistoryModule,
    TagModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
