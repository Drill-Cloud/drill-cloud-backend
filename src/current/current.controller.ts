import { Controller, Get, Header, Query, Sse, UseGuards } from '@nestjs/common';
import { EdgeAccessGuard } from '../auth/edge-access.guard';
import { KeycloakAuthGuard } from '../auth/keycloak-auth.guard';
import { Observable } from 'rxjs';
import { CurrentEventsService } from './current-events.service';
import { CurrentService } from './current.service';
import { CurrentResponseDto } from './dto/current-response.dto';
import { GetCurrentDto } from './dto/get-current.dto';
import { GetCurrentEventsDto } from './dto/get-current-events.dto';

@Controller('current')
@UseGuards(KeycloakAuthGuard, EdgeAccessGuard)
export class CurrentController {
  constructor(
    private readonly current: CurrentService,
    private readonly currentEvents: CurrentEventsService,
  ) {}

  /** Возвращает последние известные значения по одному edge с опциональным фильтром тегов. */
  @Get()
  @Header('Cache-Control', 'no-store')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  findByEdge(@Query() query: GetCurrentDto) {
    return this.current.findByEdge(query);
  }

  /** Открывает SSE-поток текущих значений по edge с отправкой только изменившихся снимков. */
  @Sse('events')
  @Header('Cache-Control', 'no-store')
  events(@Query() query: GetCurrentEventsDto): Observable<{ data: CurrentResponseDto }> {
    return this.currentEvents.stream(query);
  }
}
