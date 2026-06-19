import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { HistoryRow, HistorySource } from './history.types';

@Injectable()
export class HistoryRepository {
  constructor(private readonly db: DbService) {}

  /** Загружает последние N сырых точек истории для каждого запрошенного тега. */
  async findLatest(edge: string, tags: string[], targetPoints: number): Promise<HistoryRow[]> {
    const result = await this.db.query<HistoryRow>(
      `
        SELECT
          latest.edge,
          latest.tag,
          latest.timestamp AS time,
          latest.value,
          latest.value AS min_value,
          latest.value AS avg_value,
          latest.value AS max_value,
          1::integer AS point_count
        FROM unnest($2::varchar[]) AS requested(tag)
        CROSS JOIN LATERAL (
          SELECT edge, tag, timestamp, value
          FROM history
          WHERE edge = $1
            AND tag = requested.tag
          ORDER BY timestamp DESC
          LIMIT $3
        ) AS latest
        ORDER BY latest.tag ASC, latest.timestamp ASC
      `,
      [edge, tags, targetPoints],
    );

    return result.rows;
  }

  /** Загружает сырую историю за диапазон и агрегирует ее в бакеты под бюджет точек. */
  async findRawRange(
    edge: string,
    tags: string[],
    from: Date,
    to: Date,
    targetPoints: number,
  ): Promise<HistoryRow[]> {
    const bucketMillis = this.getBucketMillis(from, to, targetPoints);
    const fromMillis = from.getTime();
    const result = await this.db.query<HistoryRow>(
      `
        WITH filtered AS (
          SELECT
            edge,
            tag,
            floor((extract(epoch FROM timestamp) * 1000 - $5) / $6)::bigint AS bucket_id,
            value
          FROM history
          WHERE edge = $1
            AND tag = ANY($2::varchar[])
            AND timestamp >= $3
            AND timestamp <= $4
        )
        SELECT
          edge,
          tag,
          to_timestamp(($5 + bucket_id * $6) / 1000.0) AS time,
          avg(value)::double precision AS value,
          min(value)::double precision AS min_value,
          avg(value)::double precision AS avg_value,
          max(value)::double precision AS max_value,
          count(*)::integer AS point_count
        FROM filtered
        GROUP BY edge, tag, bucket_id
        ORDER BY tag ASC, time ASC
      `,
      [edge, tags, from, to, fromMillis, bucketMillis],
    );

    return result.rows;
  }

  /** Читает заранее подготовленный aggregate-view с min/avg/max/count по бакетам. */
  async findAggregateRange(
    edge: string,
    tags: string[],
    from: Date,
    to: Date,
    source: HistorySource,
  ): Promise<HistoryRow[]> {
    const result = await this.db.query<HistoryRow>(
      `
        SELECT
          edge,
          tag,
          ${source.timeColumn} AS time,
          avg_value AS value,
          min_value,
          avg_value,
          max_value,
          point_count
        FROM ${source.table}
        WHERE edge = $1
          AND tag = ANY($2::varchar[])
          AND ${source.timeColumn} >= $3
          AND ${source.timeColumn} <= $4
        ORDER BY tag ASC, ${source.timeColumn} ASC
      `,
      [edge, tags, from, to],
    );

    return result.rows;
  }

  /** Рассчитывает ширину временного бакета так, чтобы на тег было не больше targetPoints точек. */
  private getBucketMillis(from: Date, to: Date, targetPoints: number): number {
    const durationMillis = Math.max(to.getTime() - from.getTime(), 1);
    return Math.max(Math.ceil(durationMillis / Math.max(targetPoints, 1)), 1);
  }

  /** Берет теги из запроса или ищет связи edge, а затем резервно смотрит саму историю. */
  async resolveTags(edge: string, requestedTags?: string[]): Promise<string[]> {
    if (requestedTags?.length) {
      return requestedTags;
    }

    const linked = await this.db.query<{ tag: string }>(
      `
        SELECT DISTINCT tag
        FROM (
          SELECT unnest(e.tag_ids)::text AS tag
          FROM edge AS e
          WHERE e.id = $1
          UNION
          SELECT t.id AS tag
          FROM tag AS t
          WHERE $1 = ANY(t.edge_ids)
        ) AS linked_tags
        WHERE tag IS NOT NULL
        ORDER BY tag ASC
      `,
      [edge],
    );

    if (linked.rows.length) {
      return linked.rows.map((row) => row.tag);
    }

    const distinct = await this.db.query<{ tag: string }>(
      `
        SELECT DISTINCT tag
        FROM history
        WHERE edge = $1
        ORDER BY tag ASC
      `,
      [edge],
    );

    return distinct.rows.map((row) => row.tag);
  }
}
