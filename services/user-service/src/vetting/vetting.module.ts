import { Module } from '@nestjs/common';
import { VettingService } from './vetting.service';
import { VettingController } from './vetting.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';

@Module({
    imports: [PrismaModule, AiModule],
    controllers: [VettingController],
    providers: [VettingService],
    exports: [VettingService],
})
export class VettingModule { }
