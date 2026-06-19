import { BadRequestException, Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { IngestPointDto } from './dto/ingest-point.dto';

type NormalizedPoint = {
  time: Date;
  edge: string;
  tag: string;
  value: number;
};

type IngestResult = {
  processed: number;
};

@Injectable()
export class IngestService {
  constructor(private readonly db: DbService) {}

  /** Проверяет батч, пишет сырую историю и обновляет последний снимок current для UI/SSE. */
  async ingestPoints(points: IngestPointDto[]): Promise<IngestResult> {
    if (!points.length) {
      return { processed: 0 };
    }

    this.assertBatchSize(points.length);

    const normalized = points.map((point) => this.normalizePoint(point));

    await this.db.query(
      `
        INSERT INTO history (timestamp, edge, tag, value)
        SELECT time, edge, tag, value
        FROM unnest(
          $1::timestamp[],
          $2::varchar[],
          $3::varchar[],
          $4::double precision[]
        ) AS point(time, edge, tag, value)
      `,
      [
        normalized.map((point) => point.time),
        normalized.map((point) => point.edge),
        normalized.map((point) => point.tag),
        normalized.map((point) => point.value),
      ],
    );

    await this.db.query(
      `
        INSERT INTO current (edge, tag, value, "createdAt", "updatedAt")
        SELECT DISTINCT ON (edge, tag)
          edge,
          tag,
          value,
          time AS "createdAt",
          time AS "updatedAt"
        FROM unnest(
          $1::timestamp[],
          $2::varchar[],
          $3::varchar[],
          $4::double precision[]
        ) AS point(time, edge, tag, value)
        ORDER BY edge ASC, tag ASC, time DESC
        ON CONFLICT (edge, tag)
        DO UPDATE SET
          value = EXCLUDED.value,
          "updatedAt" = EXCLUDED."updatedAt"
        WHERE current."updatedAt" <= EXCLUDED."updatedAt"
      `,
      [
        normalized.map((point) => point.time),
        normalized.map((point) => point.edge),
        normalized.map((point) => point.tag),
        normalized.map((point) => point.value),
      ],
    );

    return { processed: normalized.length };
  }

  /** Защищает API от слишком больших ingest-запросов, занимающих соединение с БД надолго. */
  private assertBatchSize(size: number): void {
    const maxBatchSize = Number(process.env.INGEST_MAX_BATCH_SIZE);

    if (size > maxBatchSize) {
      throw new BadRequestException(`Batch size must not exceed ${maxBatchSize} points.`);
    }
  }

  /** Приводит входной DTO к нормализованному виду для вставки в history. */
  private normalizePoint(point: IngestPointDto): NormalizedPoint {
    const time = this.parsePointTime(point);

    return {
      edge: point.edge,
      tag: point.tag,
      value: point.value,
      time,
    };
  }

  /** Принимает ISO-время или миллисекунды Unix и отклоняет точки без валидного времени. */
  private parsePointTime(point: IngestPointDto): Date {
    if (point.time) {
      const date = new Date(point.time);
      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }

    if (point.timestamp !== undefined) {
      const date = new Date(point.timestamp);
      if (!Number.isNaN(date.getTime())) {
        return date;
      }
    }

    throw new BadRequestException('Each point must contain valid time or timestamp.');
  }
}
