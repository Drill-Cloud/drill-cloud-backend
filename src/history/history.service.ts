import { BadRequestException, Injectable } from '@nestjs/common';
import { GetHistoryBatchDto } from './dto/get-history-batch.dto';
import { GetHistoryDto } from './dto/get-history.dto';
import { HistoryResponseDto } from './dto/history-response.dto';
import { HistorySeriesRow } from './history.types';
import { HistoryRepository } from './history.repository';

function toPostgresTimestamp(date: Date): string {
  return date.toISOString().replace('T', ' ').replace('Z', '');
}

@Injectable()
export class HistoryService {
  constructor(private readonly repository: HistoryRepository) {}

  /** Получает агрегированную историю одного тега за диапазон с заданным шагом bucket. */
  async findSeries(query: GetHistoryDto): Promise<HistoryResponseDto> {
    const from = new Date(query.from);
    const to = new Date(query.to);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw new BadRequestException('Invalid from/to date.');
    }

    if (from > to) {
      throw new BadRequestException('from cannot be greater than to.');
    }

    const rows = await this.repository.findBucketedRange(query.edge, query.tag, from, to, query.granulate);
    return { rows };
  }

  /** Получает историю пачкой по нескольким тегам и группирует результат в удобную для фронта структуру. */
  async findSeriesBatch(query: GetHistoryBatchDto): Promise<{ series: Record<string, HistorySeriesRow[]> }> {
    const from = new Date(query.from);
    const to = new Date(query.to);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw new BadRequestException('Invalid from/to date.');
    }

    if (from > to) {
      throw new BadRequestException('from cannot be greater than to.');
    }

    const rows = await this.repository.findBucketedRangeByTags(
      query.edge,
      query.tags,
      toPostgresTimestamp(from),
      toPostgresTimestamp(to),
      query.granulate,
    );
    const series = rows.reduce<Record<string, HistorySeriesRow[]>>((acc, row) => {
      acc[row.tag] = acc[row.tag] ?? [];
      acc[row.tag].push(row);
      return acc;
    }, {});

    return { series };
  }
}
