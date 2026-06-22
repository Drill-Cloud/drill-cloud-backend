import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { IngestPointDto } from './dto/ingest-point.dto';

type IngestResult = {
  processed: number;
};

@Injectable()
export class IngestService {
  constructor(private readonly db: DbService) {}

  /** Пишет одну входящую точку в history и обновляет текущий снимок current для UI/SSE. */
  async ingestPoint(point: IngestPointDto): Promise<IngestResult> {
    await this.db.query(
      `
        INSERT INTO history (timestamp, edge, tag, value)
        VALUES ($1, $2, $3, $4)
      `,
      [point.timestamp, point.edge, point.tag, point.value],
    );

    await this.db.query(
      `
        INSERT INTO current (edge, tag, value, "updatedAt")
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (edge, tag)
        DO UPDATE SET
          value = $3,
          "updatedAt" = NOW()
      `,
      [point.edge, point.tag, point.value],
    );

    return { processed: 1 };
  }

  /** Сохраняет несколько точек без batch SQL: каждая точка проходит тот же линейный путь. */
  async ingestPoints(points: IngestPointDto[]): Promise<IngestResult> {
    let processed = 0;

    for (const point of points) {
      const result = await this.ingestPoint(point);
      processed += result.processed;
    }

    return { processed };
  }
}
