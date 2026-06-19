import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { EdgeRow } from './edge.types';

@Injectable()
export class EdgeRepository {
  constructor(private readonly db: DbService) {}

  /** Читает каталог edge без расчетов по текущим значениям. */
  async findAll(parentId: string | null, search: string | null): Promise<EdgeRow[]> {
    const result = await this.db.query<EdgeRow>(
      `
      SELECT
        e.id,
        e.name,
        e.parent_id,
        e.tag_ids,
        cardinality(e.tag_ids)::integer AS tag_count
      FROM edge AS e
      WHERE ($1::varchar IS NULL OR e.parent_id = $1::varchar)
        AND (
          $2::text IS NULL
          OR e.id ILIKE $2::text
          OR e.name ILIKE $2::text
        )
      ORDER BY e.name ASC, e.id ASC
      `,
      [parentId, search],
    );

    return result.rows;
  }
}
