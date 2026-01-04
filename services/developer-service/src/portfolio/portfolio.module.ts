import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PortfolioSyncService } from './portfolio-sync.service';
import { PortfolioSyncController } from './portfolio-sync.controller';

@Module({
    imports: [HttpModule],
    controllers: [PortfolioSyncController],
    providers: [PortfolioSyncService],
    exports: [PortfolioSyncService],
})
export class PortfolioModule { }
