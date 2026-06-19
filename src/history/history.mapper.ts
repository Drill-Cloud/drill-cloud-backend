import {
  HistoryResponseDto,
  HistoryResponseSource,
  HistorySeriesDto,
} from './dto/history-response.dto';
import { HistoryRow } from './history.types';

type HistoryResponseOptions = {
  edge: string;
  source: HistoryResponseSource;
  targetPoints: number;
  rows?: HistoryRow[];
  from?: Date;
  to?: Date;
  resolutionSeconds?: number | null;
};

/** Превращает плоские строки истории в стабильный API-формат для графиков. */
export function createHistoryResponse(options: HistoryResponseOptions): HistoryResponseDto {
  return {
    edge: options.edge,
    source: options.source,
    targetPoints: options.targetPoints,
    series: mapHistoryRowsToSeries(options.rows ?? []),
    from: options.from,
    to: options.to,
    resolutionSeconds: options.resolutionSeconds,
  };
}

/** Группирует строки БД по edge/tag и переводит Date в миллисекунды Unix. */
function mapHistoryRowsToSeries(rows: HistoryRow[]): HistorySeriesDto[] {
  const seriesMap = new Map<string, HistorySeriesDto>();

  for (const row of rows) {
    const key = `${row.edge}\u0000${row.tag}`;
    const series = seriesMap.get(key) ?? {
      edge: row.edge,
      tag: row.tag,
      points: [],
    };

    series.points.push({
      t: row.time.getTime(),
      v: row.value,
      min: row.min_value,
      avg: row.avg_value,
      max: row.max_value,
      count: row.point_count,
    });
    seriesMap.set(key, series);
  }

  return Array.from(seriesMap.values());
}
