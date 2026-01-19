import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AcademyService } from './academy.service';
import { AcademyController } from './academy.controller';

@Module({
    imports: [HttpModule],
    providers: [AcademyService],
    controllers: [AcademyController],
    exports: [AcademyService],
})
export class AcademyModule { }
