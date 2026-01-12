import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.listen(process.env.PORT || 3017); // Standardized port for talent-cloud-service
    console.log(`Talent Cloud Service is running on: ${await app.getUrl()}`);
}
bootstrap();
