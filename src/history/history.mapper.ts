import { HistoryResponseDto, HistorySeriesDto } from './dto/history-response.dto';
import { HistoryRow } from './history.types';

type HistoryResponseOptions = {
  edge: string;
  tag: string;
  from: Date;
  to: Date;
  granulate: string;
  rows: HistoryRow[];
};

/** Переводит строки агрегированной истории в формат графика min/avg/max. */
export function createHistoryResponse(options: HistoryResponseOptions): HistoryResponseDto {
  return {
    edge: options.edge,
    tag: options.tag,
    from: options.from,
    to: options.to,
    granulate: options.granulate,
    series: options.rows.length
      ? [
          {
            edge: options.edge,
            tag: options.tag,
            points: mapHistoryRowsToPoints(options.rows),
          },
        ]
      : [],
  };
}

function mapHistoryRowsToPoints(rows: HistoryRow[]): HistorySeriesDto['points'] {
  return rows.map((row) => ({
    t: row.time.getTime(),
    min: row.min_value,
    avg: row.avg_value,
    max: row.max_value,
    count: row.point_count,
  }));
}
