import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);

    app.enableCors();

    const port = process.env.PORT || 3016;
    await app.listen(port);

    logger.log(`Developer Service is running on: http://localhost:${port}`);
}
bootstrap();
