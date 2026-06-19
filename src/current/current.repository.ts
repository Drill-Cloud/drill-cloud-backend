import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { CurrentRow } from './current.types';

@Injectable()
export class CurrentRepository {
  constructor(private readonly db: DbService) {}

  /** Читает текущие значения и добавляет метаданные тегов для UI-дашбордов. */
  async findByEdge(edge: string, tags: string[] | null): Promise<CurrentRow[]> {
    const result = await this.db.query<CurrentRow>(
      `
        SELECT
          c.edge,
          c.tag,
          c.value,
          c."createdAt",
          c."updatedAt",
          t.name,
          t.tag_group,
          t.min,
          t.max,
          t.comment,
          t.unit_of_measurement,
          t.precision
        FROM current AS c
        LEFT JOIN tag AS t
          ON t.id = c.tag
        WHERE c.edge = $1
          AND ($2::varchar[] IS NULL OR c.tag = ANY($2::varchar[]))
        ORDER BY c.tag ASC
      `,
      [edge, tags],
    );

    return result.rows;
  }
}
