import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { IngestApiKeyGuard } from '../common/ingest-api-key.guard';
import { IngestEdgeValuesDto } from './dto/ingest-edge-values.dto';
import { IngestPointDto } from './dto/ingest-point.dto';
import { IngestService } from './ingest.service';

@Controller('ingest')
@UseGuards(IngestApiKeyGuard)
export class IngestController {
  constructor(private readonly ingest: IngestService) {}

  @Post()
  ingestPoint(@Body() point: IngestPointDto) {
    return this.ingest.ingestPoint(point);
  }

  @Post(':edge')
  ingestEdgeValues(
    @Param('edge') edge: string,
    @Body() body: IngestEdgeValuesDto,
  ) {
    const points = Object.entries(body.values).map(([tag, value]) => ({
      edge,
      tag,
      value,
      timestamp: body.timestamp,
    }));

    return this.ingest.ingestPoints(points);
  }
}
