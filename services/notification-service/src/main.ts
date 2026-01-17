import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  }));
  app.enableCors({
    origin: true, // Allow all origins for development, or specify your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3007;
  await app.listen(port);
  console.log(`Notification Service is running on: ${await app.getUrl()}`);
}
bootstrap();
