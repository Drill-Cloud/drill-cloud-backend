import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getIntegerConfig } from '../common/config-number';
import { normalizeRequiredText } from '../common/normalize-text';
import { GetHistoryDto } from './dto/get-history.dto';
import { HistoryResponseDto } from './dto/history-response.dto';
import { chooseHistorySource } from './history-source';
import { createHistoryResponse } from './history.mapper';
import { HistoryRepository } from './history.repository';

@Injectable()
export class HistoryService {
  constructor(
    private readonly repository: HistoryRepository,
    private readonly config: ConfigService,
  ) {}

  /** Определяет теги, выбирает слой истории и собирает API-ответ для графика. */
  async findSeries(query: GetHistoryDto): Promise<HistoryResponseDto> {
    const edge = normalizeRequiredText(query.edge, 'edge');
    const targetPoints = this.getTargetPoints(query.targetPoints);
    const tags = await this.repository.resolveTags(edge, query.tags);

    if (!tags.length) {
      return createHistoryResponse({
        edge,
        source: 'empty',
        targetPoints,
      });
    }

    if (!query.from && !query.to) {
      const rows = await this.repository.findLatest(edge, tags, targetPoints);
      return createHistoryResponse({
        edge,
        source: 'latest',
        targetPoints,
        rows,
      });
    }

    const { from, to } = this.parseRange(query);
    const source = chooseHistorySource(from, to, targetPoints);
    const rows =
      source.name === 'raw'
        ? await this.repository.findRawRange(edge, tags, from, to, targetPoints)
        : await this.repository.findAggregateRange(edge, tags, from, to, source);

    return createHistoryResponse({
      edge,
      from,
      to,
      source: source.name,
      resolutionSeconds: source.intervalSeconds || null,
      targetPoints,
      rows,
    });
  }

  /** Разбирает опциональный диапазон времени и отклоняет неверные или обратные границы. */
  private parseRange(query: GetHistoryDto): { from: Date; to: Date } {
    const from = query.from ? new Date(query.from) : new Date(0);
    const to = query.to ? new Date(query.to) : new Date();

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      throw new BadRequestException('Invalid from/to date.');
    }

    if (from > to) {
      throw new BadRequestException('from cannot be greater than to.');
    }

    return { from, to };
  }

  /** Применяет лимиты точек по умолчанию и максимуму, чтобы ответ истории был удобным для графиков. */
  private getTargetPoints(requested?: number): number {
    const defaultValue = getIntegerConfig(this.config, 'HISTORY_TARGET_POINTS', 2000);
    const maxValue = getIntegerConfig(this.config, 'HISTORY_MAX_TARGET_POINTS', 5000);
    const value = requested ?? defaultValue;
    return Math.min(Math.max(Math.floor(value), 100), maxValue);
  }
}
