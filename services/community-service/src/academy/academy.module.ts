import { Module } from '@nestjs/common';
import { AcademyService } from './academy.service';
import { AcademyController } from './academy.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [AcademyService],
    controllers: [AcademyController],
    exports: [AcademyService],
})
export class AcademyModule { }
