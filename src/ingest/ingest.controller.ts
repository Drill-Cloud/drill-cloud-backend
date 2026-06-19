import { Body, Controller, Param, ParseArrayPipe, Post, UseGuards } from '@nestjs/common';
import { IngestApiKeyGuard } from '../common/ingest-api-key.guard';
import { IngestEdgeValuesDto } from './dto/ingest-edge-values.dto';
import { IngestPointDto } from './dto/ingest-point.dto';
import { IngestService } from './ingest.service';

@Controller('ingest')
@UseGuards(IngestApiKeyGuard)
export class IngestController {
  constructor(private readonly ingest: IngestService) {}

  /** Принимает массив сырых точек и сохраняет их как записи истории. */
  @Post()
  ingestPoints(
    @Body(new ParseArrayPipe({ items: IngestPointDto }))
    points: IngestPointDto[],
  ) {
    return this.ingest.ingestPoints(points);
  }

  /** Принимает компактное тело запроса по edge и разворачивает каждое значение в точку истории. */
  @Post(':edge')
  ingestEdgeValues(@Param('edge') edge: string, @Body() body: IngestEdgeValuesDto) {
    const points = Object.entries(body.values).map(([tag, value]) => ({
      edge,
      tag,
      value: Number(value),
      time: body.time,
      timestamp: body.timestamp,
    }));

    return this.ingest.ingestPoints(points);
  }
}
