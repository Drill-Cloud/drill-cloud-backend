import { Controller, Get, Header, Query, UseGuards } from '@nestjs/common';
import { EdgeAccessGuard } from '../auth/edge-access.guard';
import { KeycloakAuthGuard } from '../auth/keycloak-auth.guard';
import { GetHistoryDto } from './dto/get-history.dto';
import { HistoryService } from './history.service';

@Controller('history')
@UseGuards(KeycloakAuthGuard, EdgeAccessGuard)
export class HistoryController {
  constructor(private readonly history: HistoryService) {}

  /** Возвращает серии истории для графиков по одному edge: последние значения или сырой диапазон. */
  @Get()
  @Header('Cache-Control', 'no-store')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  findSeries(@Query() query: GetHistoryDto) {
    return this.history.findSeries(query);
  }
}
