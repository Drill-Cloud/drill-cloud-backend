import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { DB_MIGRATIONS, DbMigration } from './migrations';

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
      application_name: 'drill-cloud-v3',
    });

    await this.runMigrations();
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

  private async runMigrations(): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query(`SELECT pg_advisory_lock(hashtext('drill-cloud-v3:migrations'))`);
      await this.ensureMigrationsTable(client);

      for (const migration of DB_MIGRATIONS) {
        const applied = await this.isMigrationApplied(client, migration.id);
        if (applied) continue;

        await client.query('BEGIN');
        try {
          await client.query(this.readMigrationSql(migration));
          await client.query('INSERT INTO public.schema_migrations (id) VALUES ($1)', [migration.id]);
          await client.query('COMMIT');
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }
      }
    } finally {
      await client.query(`SELECT pg_advisory_unlock(hashtext('drill-cloud-v3:migrations'))`);
      client.release();
    }
  }

  private async ensureMigrationsTable(client: PoolClient): Promise<void> {
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        id varchar(120) PRIMARY KEY,
        applied_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
  }

  private async isMigrationApplied(client: PoolClient, id: string): Promise<boolean> {
    const result = await client.query<{ exists: boolean }>(
      'SELECT EXISTS (SELECT 1 FROM public.schema_migrations WHERE id = $1)',
      [id],
    );

    return result.rows[0]?.exists ?? false;
  }

  private readMigrationSql(migration: DbMigration): string {
    return readFileSync(join(process.cwd(), 'migrations', migration.fileName), 'utf8');
  }
}
