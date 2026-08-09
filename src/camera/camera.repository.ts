import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { CameraRow } from './camera.types';

@Injectable()
export class CameraRepository {
  constructor(private readonly db: DbService) {}

  async findByEdge(edge: string): Promise<CameraRow[]> {
    const result = await this.db.query<CameraRow>(
      `
        SELECT name, protocol, source
        FROM camera
        WHERE edge = $1
        ORDER BY name ASC, source ASC
      `,
      [edge],
    );

    return result.rows;
  }
}
