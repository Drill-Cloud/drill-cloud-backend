import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { TagRow } from './tag.types';

@Injectable()
export class TagRepository {
  constructor(private readonly db: DbService) {}

  /** Reads the tag catalog. */
  async findAll(search: string | null): Promise<TagRow[]> {
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
          t.precision
        FROM tag AS t
        WHERE (
          $1::text IS NULL
          OR t.id ILIKE $1::text
          OR t.name ILIKE $1::text
          OR t.comment ILIKE $1::text
        )
        ORDER BY
          NULLIF(t.tag_group, '') ASC NULLS LAST,
          t.name ASC,
          t.id ASC
      `,
      [search],
    );

    return result.rows;
  }
}
