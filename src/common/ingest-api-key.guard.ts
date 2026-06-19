import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class IngestApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  /** По умолчанию открывает ingest, но проверяет x-api-key, если задан INGEST_API_KEY. */
  canActivate(context: ExecutionContext): boolean {
    const expectedKey = this.config.get<string>('INGEST_API_KEY');
    if (!expectedKey) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const actualKey = request.header('x-api-key');
    if (actualKey !== expectedKey) {
      throw new UnauthorizedException('Invalid ingest API key.');
    }

    return true;
  }
}
