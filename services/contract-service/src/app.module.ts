import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContractsModule } from './contracts/contracts.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ContractsModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
