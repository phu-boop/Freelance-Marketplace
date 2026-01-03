import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    Request,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';
import { Public } from 'nest-keycloak-connect';

@Controller('api/reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Post()
    create(@Body() createReviewDto: CreateReviewDto) {
        return this.reviewsService.create(createReviewDto);
    }

    @Public()
    @Get()
    findAll(@Query('reviewee_id') reviewee_id?: string) {
        if (reviewee_id) {
            return this.reviewsService.findByReviewee(reviewee_id);
        }
        return this.reviewsService.findAll();
    }

    @Public()
    @Get('reviewee/:userId')
    async findByReviewee(@Param('userId') userId: string) {
        return this.reviewsService.findByReviewee(userId);
    }

    @Public()
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.reviewsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
        return this.reviewsService.update(id, updateReviewDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.reviewsService.remove(id);
    }

    @Post(':id/reply')
    reply(
        @Param('id') id: string,
        @Body() replyDto: ReplyReviewDto,
        @Request() req: any
    ) {
        const userId = req.user?.sub;
        return this.reviewsService.addReply(id, replyDto.reply, userId);
    }

    @Post(':id/report')
    report(
        @Param('id') id: string,
        @Body() body: { reason: string },
        @Request() req: any
    ) {
        const userId = req.user?.sub;
        return this.reviewsService.reportReview(id, userId, body.reason);
    }

    @Post('request-review')
    requestReview(
        @Body() body: { contractId: string, clientId: string, freelancerName: string },
        @Request() req: any
    ) {
        const freelancerId = req.user?.sub;
        return this.reviewsService.requestReview(body.contractId, freelancerId, body.clientId, body.freelancerName);
    }
}
