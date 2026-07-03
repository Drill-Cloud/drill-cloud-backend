import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import { AppModule } from './app.module';
import { DbService } from './db/db.service';

type CurrentDatabaseRow = {
  database: string;
};

function getMaskedDatabaseUrl(): string | undefined {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return undefined;
  }

  try {
    const url = new URL(databaseUrl);
    const username = url.username ? `${url.username}:***@` : '';
    return `${url.protocol}//${username}${url.host}${url.pathname}`;
  } catch {
    return databaseUrl.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:***@');
  }
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  app.use(compression());
  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT as string);

  const db = app.get(DbService);
  const currentDatabase = await db.query<CurrentDatabaseRow>(
    'SELECT current_database() AS database',
  );

  logger.log({
    event: 'cloud.started',
    port: process.env.PORT,
    branch: process.env.BRANCH ?? process.env.branch ?? '',
    database: currentDatabase.rows[0]?.database,
    databaseUrl: getMaskedDatabaseUrl(),
    ingestDebugLog: process.env.INGEST_DEBUG_LOG ?? '',
  });
}

void bootstrap();
