import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool, QueryResult, QueryResultRow } from 'pg';

type DatabaseHealth = {
  now: Date;
  timescaledb_installed: boolean;
  timescaledb_version: string | null;
};

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private pool!: Pool;

  /** Создает пул PostgreSQL и проверяет БД до начала обработки запросов. */
  async onModuleInit(): Promise<void> {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      statement_timeout: 60_000,
      query_timeout: 60_000,
      application_name: 'drill-cloud',
    });

    await this.health();
  }

  /** Закрывает пул PostgreSQL при остановке Nest-приложения. */
  async onModuleDestroy(): Promise<void> {
    await this.pool?.end();
  }

  /** Выполняет параметризованный SQL-запрос через общий пул PostgreSQL. */
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    values: readonly unknown[] = [],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, [...values]);
  }

  /** Возвращает легкий health-снимок БД, включая статус расширения TimescaleDB. */
  async health(): Promise<DatabaseHealth> {
    const result = await this.query<DatabaseHealth>(`
      SELECT
        now(),
        ext.extversion IS NOT NULL AS timescaledb_installed,
        ext.extversion AS timescaledb_version
      FROM (SELECT 1) AS probe
      LEFT JOIN pg_extension AS ext
        ON ext.extname = 'timescaledb'
    `);

    return result.rows[0];
  }
}
