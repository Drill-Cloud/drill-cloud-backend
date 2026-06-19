import { Injectable } from '@nestjs/common';
import { GetTagsDto } from './dto/get-tags.dto';
import { TagResponseDto } from './dto/tag-response.dto';
import { createTagResponse } from './tag.mapper';
import { TagRepository } from './tag.repository';

@Injectable()
export class TagService {
  constructor(private readonly repository: TagRepository) {}

  /** Нормализует фильтры и возвращает метаданные тегов для UI. */
  async findAll(query: GetTagsDto): Promise<TagResponseDto> {
    const edge = query.edge ?? null;
    const search = query.search ? `%${query.search}%` : null;
    const rows = await this.repository.findAll(edge, search);
    return createTagResponse(rows);
  }
}
