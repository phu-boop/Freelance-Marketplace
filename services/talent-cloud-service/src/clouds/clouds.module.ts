import { Module } from '@nestjs/common';
import { CloudsService } from './clouds.service';
import { CloudsController } from './clouds.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [PrismaModule, HttpModule],
    controllers: [CloudsController],
    providers: [CloudsService],
    exports: [CloudsService],
})
export class CloudsModule { }
