import { Body, Controller, Logger, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { IngestApiKeyGuard } from '../common/ingest-api-key.guard';
import { IngestEdgeValuesDto } from './dto/ingest-edge-values.dto';
import { IngestPointDto } from './dto/ingest-point.dto';
import { IngestService } from './ingest.service';

@Controller('ingest')
@UseGuards(IngestApiKeyGuard)
export class IngestController {
  private readonly logger = new Logger(IngestController.name);

  constructor(private readonly ingest: IngestService) {}

  @Post()
  ingestPoint(@Body() point: IngestPointDto, @Req() request: Request) {
    this.logIngestRequest(request, {
      kind: 'point',
      edge: point.edge,
      tag: point.tag,
      timestamp: point.timestamp,
    });

    return this.ingest.ingestPoint(point);
  }

  @Post(':edge')
  ingestEdgeValues(
    @Param('edge') edge: string,
    @Body() body: IngestEdgeValuesDto,
    @Req() request: Request,
  ) {
    const tags = Object.keys(body.values);
    this.logIngestRequest(request, {
      kind: 'edge-values',
      edge,
      tagCount: tags.length,
      firstTags: tags.slice(0, 5),
      timestamp: body.timestamp,
    });

    const points = Object.entries(body.values).map(([tag, value]) => ({
      edge,
      tag,
      value: Number(value),
      timestamp: body.timestamp,
    }));

    return this.ingest.ingestPoints(points);
  }

  private logIngestRequest(
    request: Request,
    payload: Record<string, unknown>,
  ): void {
    if (!this.isDebugLogEnabled()) {
      return;
    }

    this.logger.log({
      event: 'ingest.received',
      method: request.method,
      url: request.originalUrl,
      host: request.get('host'),
      ip: request.ip,
      remoteAddress: request.socket.remoteAddress,
      forwardedFor: request.get('x-forwarded-for'),
      realIp: request.get('x-real-ip'),
      userAgent: request.get('user-agent'),
      contentLength: request.get('content-length'),
      ...payload,
    });
  }

  private isDebugLogEnabled(): boolean {
    return ['1', 'true', 'yes', 'on'].includes(
      (process.env.INGEST_DEBUG_LOG ?? '').toLowerCase(),
    );
  }
}
