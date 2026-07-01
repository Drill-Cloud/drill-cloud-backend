import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import { AppModule } from './app.module';

/** Запускает HTTP API со сжатием, CORS и глобальной валидацией DTO. */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(compression());

  app.enableCors({
    origin: process.env.CORS_ALLOWED_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT as string);
}

void bootstrap();
