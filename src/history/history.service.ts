import { BadRequestException, Injectable } from '@nestjs/common';
import { GetHistoryDto } from './dto/get-history.dto';
import { HistoryResponseDto } from './dto/history-response.dto';
import { HistoryRepository } from './history.repository';

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
}
