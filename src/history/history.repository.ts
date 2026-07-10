import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { HistoryRow, HistorySeriesRow } from './history.types';

@Injectable()
export class HistoryRepository {
  constructor(private readonly db: DbService) {}

  /** Агрегирует сырую историю по одному тегу через TimescaleDB time_bucket. */
  async findBucketedRange(
    edge: string,
    tag: string,
    from: Date,
    to: Date,
    granulate: string,
  ): Promise<HistoryRow[]> {
    const result = await this.db.query<HistoryRow>(
      `
        SELECT
          time_bucket($5::interval, timestamp) AS time,
          min(value)::double precision AS min_value,
          avg(value)::double precision AS avg_value,
          max(value)::double precision AS max_value,
          count(*)::integer AS point_count
        FROM history
        WHERE edge = $1
          AND tag = $2
          AND timestamp >= $3
          AND timestamp < $4
        GROUP BY time
        ORDER BY time ASC
      `,
      [edge, tag, from, to, granulate],
    );

    return result.rows;
  }

  /** Агрегирует историю сразу по нескольким тегам, чтобы live-график не создавал десятки параллельных запросов. */
  async findBucketedRangeByTags(
    edge: string,
    tags: string[],
    from: string,
    to: string,
    granulate: string,
  ): Promise<HistorySeriesRow[]> {
    const result = await this.db.query<HistorySeriesRow>(
      `
        SELECT
          tag,
          to_char(time_bucket($5::interval, timestamp), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS time,
          min(value)::double precision AS min_value,
          avg(value)::double precision AS avg_value,
          max(value)::double precision AS max_value,
          count(*)::integer AS point_count
        FROM history
        WHERE edge = $1
          AND tag = ANY($2::varchar[])
          AND timestamp >= $3::timestamp
          AND timestamp < $4::timestamp
        GROUP BY tag, time
        ORDER BY tag ASC, time ASC
      `,
      [edge, tags, from, to, granulate],
    );

    return result.rows;
  }
}
