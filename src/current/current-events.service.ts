import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { distinctUntilChanged, from, map, Observable, switchMap, timer } from 'rxjs';
import { getIntegerConfig } from '../common/config-number';
import { CurrentResponseDto } from './dto/current-response.dto';
import { GetCurrentDto } from './dto/get-current.dto';
import { CurrentService } from './current.service';

type CurrentSseMessage = {
  data: CurrentResponseDto;
};

type CurrentSnapshot = {
  signature: string;
  response: CurrentResponseDto;
};

const DEFAULT_CURRENT_EVENTS_POLL_MS = 1_000;

@Injectable()
export class CurrentEventsService {
  constructor(
    private readonly current: CurrentService,
    private readonly config: ConfigService,
  ) {}

  /** Отправляет SSE-события current только при изменении снимка данных по edge/tags. */
  stream(query: GetCurrentDto): Observable<CurrentSseMessage> {
    const pollMs = Math.max(
      getIntegerConfig(this.config, 'CURRENT_EVENTS_POLL_MS', DEFAULT_CURRENT_EVENTS_POLL_MS),
      250,
    );

    return timer(0, pollMs).pipe(
      switchMap(() => from(this.createSnapshot(query))),
      distinctUntilChanged((previous, current) => previous.signature === current.signature),
      map((snapshot) => ({ data: snapshot.response })),
    );
  }

  /** Собирает стабильную подпись ответа, чтобы не слать одинаковые SSE-события повторно. */
  private async createSnapshot(query: GetCurrentDto): Promise<CurrentSnapshot> {
    const response = await this.current.findByEdge(query);
    return {
      response,
      signature: JSON.stringify(response),
    };
  }
}
