import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class IngestApiKeyGuard implements CanActivate {
  /** По умолчанию открывает ingest, но проверяет x-api-key, если задан INGEST_API_KEY. */
  canActivate(context: ExecutionContext): boolean {
    const expectedKey = process.env.INGEST_API_KEY;
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
