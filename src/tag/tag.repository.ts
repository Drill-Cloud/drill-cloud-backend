import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { TagRow } from './tag.types';

@Injectable()
export class TagRepository {
  constructor(private readonly db: DbService) {}

  /** Читает метаданные тегов с учетом связей из tag.edge_ids и edge.tag_ids. */
  async findAll(edge: string | null, search: string | null): Promise<TagRow[]> {
    const result = await this.db.query<TagRow>(
      `
        SELECT
          t.id,
          t.name,
          t.tag_group,
          t.min,
          t.max,
          t.comment,
          t.unit_of_measurement,
          t.edge_ids,
          t.precision
        FROM tag AS t
        WHERE (
          $1::varchar IS NULL
          OR $1::varchar = ANY(t.edge_ids)
          OR EXISTS (
            SELECT 1
            FROM edge AS e
            WHERE e.id = $1::varchar
              AND t.id = ANY(e.tag_ids)
          )
        )
          AND (
            $2::text IS NULL
            OR t.id ILIKE $2::text
            OR t.name ILIKE $2::text
            OR t.comment ILIKE $2::text
          )
        ORDER BY
          NULLIF(t.tag_group, '') ASC NULLS LAST,
          t.name ASC,
          t.id ASC
      `,
      [edge, search],
    );

    return result.rows;
  }
}
