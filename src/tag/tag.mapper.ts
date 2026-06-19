import { TagResponseDto } from './dto/tag-response.dto';
import { TagRow } from './tag.types';

/** Преобразует строки БД tag в стабильный DTO для API. */
export function createTagResponse(rows: TagRow[]): TagResponseDto {
  return {
    items: rows.map((row) => ({
      id: row.id,
      name: row.name,
      tagGroup: row.tag_group,
      min: row.min,
      max: row.max,
      comment: row.comment,
      unitOfMeasurement: row.unit_of_measurement,
      edgeIds: row.edge_ids ?? [],
      precision: row.precision,
    })),
  };
}
