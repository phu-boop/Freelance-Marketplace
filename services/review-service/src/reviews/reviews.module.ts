import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { JssService } from './jss.service';

@Module({
    imports: [HttpModule],
    controllers: [ReviewsController],
    providers: [ReviewsService, JssService],
    exports: [ReviewsService, JssService],
})
export class ReviewsModule { }
