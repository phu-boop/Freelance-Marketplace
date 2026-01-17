import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { AppModule } from './app.module';

import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  // Security
  app.use(helmet());
  // CORS is handled by Kong Gateway
  /*
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  */

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        console.error('VALIDATION ERROR:', JSON.stringify(errors, null, 2));
        return new BadRequestException(errors);
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
