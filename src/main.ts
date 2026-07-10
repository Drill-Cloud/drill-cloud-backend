import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import type { Request, Response } from 'express';
import { AppModule } from './app.module';

function shouldCompress(req: Request, res: Response): boolean {
  if (req.path === '/api/current/events') {
    return false;
  }

  return compression.filter(req, res);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(compression({ filter: shouldCompress }));
  app.setGlobalPrefix('api');

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
