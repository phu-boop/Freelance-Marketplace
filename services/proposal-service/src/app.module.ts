import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProposalsModule } from './proposals/proposals.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ProposalsModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
