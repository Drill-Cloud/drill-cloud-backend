import { CurrentResponseDto } from './dto/current-response.dto';
import { CurrentRow } from './current.types';

/** Преобразует строки БД current в стабильный DTO для API. */
export function createCurrentResponse(edge: string, rows: CurrentRow[]): CurrentResponseDto {
  return {
    edge,
    items: rows.map((row) => ({
      edge: row.edge,
      tag: row.tag,
      value: row.value,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      time: row.updatedAt,
      name: row.name,
      tagGroup: row.tag_group,
      min: row.min,
      max: row.max,
      comment: row.comment,
      unitOfMeasurement: row.unit_of_measurement,
      precision: row.precision,
    })),
  };
}
