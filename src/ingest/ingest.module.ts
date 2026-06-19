import { Module } from '@nestjs/common';
import { IngestApiKeyGuard } from '../common/ingest-api-key.guard';
import { IngestController } from './ingest.controller';
import { IngestService } from './ingest.service';

@Module({
  controllers: [IngestController],
  providers: [IngestService, IngestApiKeyGuard],
})
export class IngestModule {}
