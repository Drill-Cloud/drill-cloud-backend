import { Injectable } from '@nestjs/common';
import { CurrentResponseDto } from './dto/current-response.dto';
import { GetCurrentDto } from './dto/get-current.dto';
import { createCurrentResponse } from './current.mapper';
import { CurrentRepository } from './current.repository';

@Injectable()
export class CurrentService {
  constructor(private readonly repository: CurrentRepository) {}

  /** Нормализует фильтры и возвращает текущие значения по одному edge. */
  async findByEdge(query: GetCurrentDto): Promise<CurrentResponseDto> {
    const edge = query.edge;
    const tags = query.tags?.length ? query.tags : null;
    const rows = await this.repository.findByEdge(edge, tags);
    return createCurrentResponse(edge, rows);
  }
}
