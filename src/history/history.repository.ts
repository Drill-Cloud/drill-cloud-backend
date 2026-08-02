import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { HistoryBatchRow, HistoryRow } from './history.types';

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

  /** Агрегирует короткую историю сразу по набору тегов для live-графика показателей. */
  async findBucketedRangeForTags(
    edge: string,
    tags: string[],
    from: string,
    to: string,
    granulate: string,
  ): Promise<HistoryBatchRow[]> {
    if (tags.length === 0) {
      return [];
    }

    const result = await this.db.query<HistoryBatchRow>(
      `
        SELECT
          tag,
          time_bucket($5::interval, timestamp)::text AS time,
          avg(value)::double precision AS value
        FROM history
        WHERE edge = $1
          AND tag = ANY($2::text[])
          AND timestamp >= $3::timestamp
          AND timestamp < $4::timestamp
        GROUP BY tag, time_bucket($5::interval, timestamp)
        ORDER BY tag ASC, time_bucket($5::interval, timestamp) ASC
      `,
      [edge, tags, from, to, granulate],
    );

    return result.rows;
  }
}
