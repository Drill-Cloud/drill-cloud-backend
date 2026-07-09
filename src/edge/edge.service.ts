import { Injectable } from '@nestjs/common';
import { AuthUser } from '../auth/auth.types';
import { EdgeResponseDto } from './dto/edge-response.dto';
import { GetEdgesDto } from './dto/get-edges.dto';
import { createEdgeResponse } from './edge.mapper';
import { EdgeRepository } from './edge.repository';

@Injectable()
export class EdgeService {
  constructor(private readonly repository: EdgeRepository) {}

  /** Нормализует фильтры и возвращает каталог edge для UI. */
  async findAll(query: GetEdgesDto = {}, user: AuthUser): Promise<EdgeResponseDto> {
    const parentId = query.parentId ?? null;
    const search = query.search ? `%${query.search}%` : null;
    const allowedEdges = user.isAdmin ? null : user.allowedEdges;
    const rows = await this.repository.findAll(parentId, search, allowedEdges);
    return createEdgeResponse(rows);
  }
}
