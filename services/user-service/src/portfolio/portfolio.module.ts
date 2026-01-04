import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PortfolioSyncService } from './portfolio-sync.service';
import { PortfolioSyncController } from './portfolio-sync.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [HttpModule, ConfigModule, PrismaModule],
    controllers: [PortfolioSyncController],
    providers: [PortfolioSyncService],
    exports: [PortfolioSyncService],
})
export class PortfolioModule { }
