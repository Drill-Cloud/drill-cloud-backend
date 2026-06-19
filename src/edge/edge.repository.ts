import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { EdgeRow } from './edge.types';

@Injectable()
export class EdgeRepository {
  constructor(private readonly db: DbService) {}

  /** Читает каталог edge с легкими счетчиками свежести из текущих значений. */
  async findAll(parentId: string | null, search: string | null): Promise<EdgeRow[]> {
    const result = await this.db.query<EdgeRow>(
      `
      SELECT
        e.id,
        e.name,
        e.parent_id,
        e.tag_ids,
        cardinality(e.tag_ids)::integer AS tag_count,
        count(DISTINCT c.tag)::integer AS current_tag_count,
        count(DISTINCT c.tag) FILTER (
          WHERE c."updatedAt" >= now() - INTERVAL '30 seconds'
        )::integer AS live_tag_count,
        max(c."updatedAt") AS last_data_at
      FROM edge AS e
      LEFT JOIN current AS c
        ON c.edge = e.id
        AND (cardinality(e.tag_ids) = 0 OR c.tag = ANY(e.tag_ids))
      WHERE ($1::varchar IS NULL OR e.parent_id = $1::varchar)
        AND (
          $2::text IS NULL
          OR e.id ILIKE $2::text
          OR e.name ILIKE $2::text
        )
      GROUP BY e.id, e.name, e.parent_id, e.tag_ids
      ORDER BY e.name ASC, e.id ASC
      `,
      [parentId, search],
    );

    return result.rows;
  }
}
