import { Controller, Get, Header, Query } from '@nestjs/common';
import { GetHistoryDto } from './dto/get-history.dto';
import { HistoryService } from './history.service';

@Controller('history')
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
