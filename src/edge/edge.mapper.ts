import { EdgeResponseDto } from './dto/edge-response.dto';
import { EdgeRow } from './edge.types';

/** Преобразует строки БД edge в стабильный DTO для API. */
export function createEdgeResponse(rows: EdgeRow[]): EdgeResponseDto {
  return {
    items: rows.map((row) => ({
      id: row.id,
      name: row.name,
      parentId: row.parent_id,
    })),
  };
}
