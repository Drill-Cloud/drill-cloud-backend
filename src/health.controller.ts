import { Controller, Get } from '@nestjs/common';
import { DbService } from './db/db.service';

@Controller()
export class HealthController {
  constructor(private readonly db: DbService) {}

  /** Проверяет доступность API и базы данных для деплоя и проверок здоровья. */
  @Get('health')
  async health() {
    const database = await this.db.health();
    return {
      status: 'ok',
      database,
    };
  }
}
