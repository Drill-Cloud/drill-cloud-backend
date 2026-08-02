import { BadRequestException, Injectable } from '@nestjs/common';
import { GetHistoryBatchDto } from './dto/get-history-batch.dto';
import { GetHistoryDto } from './dto/get-history.dto';
import { HistoryBatchResponseDto, HistoryResponseDto } from './dto/history-response.dto';
import { HistoryRepository } from './history.repository';

function toTimestampWithoutTimezone(value: Date): string {
  return value.toISOString().replace('T', ' ').replace('Z', '');
}

function timestampWithoutTimezoneToIso(value: string): string {
  return `${value.replace(' ', 'T')}Z`;
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

  /** Получает короткую историю сразу по нескольким тегам одним запросом. */
  async findSeriesBatch(query: GetHistoryBatchDto): Promise<HistoryBatchResponseDto> {
    const from = new Date(query.from);
    const to = new Date(query.to);
    const tags = query.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw new BadRequestException('Invalid from/to date.');
    }

    if (from > to) {
      throw new BadRequestException('from cannot be greater than to.');
    }

    if (tags.length === 0) {
      throw new BadRequestException('tags cannot be empty.');
    }

    const rows = await this.repository.findBucketedRangeForTags(
      query.edge,
      tags,
      toTimestampWithoutTimezone(from),
      toTimestampWithoutTimezone(to),
      query.granulate,
    );

    return {
      rows: rows.map((row) => ({
        ...row,
        time: timestampWithoutTimezoneToIso(row.time),
      })),
    };
  }
}
