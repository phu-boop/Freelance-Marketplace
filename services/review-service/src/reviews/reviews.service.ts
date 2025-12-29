import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
    constructor(
        private prisma: PrismaService,
        private httpService: HttpService,
        private configService: ConfigService
    ) { }

    async create(createReviewDto: CreateReviewDto) {
        const review = await this.prisma.review.create({
            data: createReviewDto,
        });

        // Trigger user stats update
        try {
            const userServiceUrl = this.configService.get<string>('USER_SERVICE_INTERNAL_URL', 'http://user-service:3000');
            await firstValueFrom(
                this.httpService.post(`${userServiceUrl}/${createReviewDto.reviewee_id}/stats`, {
                    rating: createReviewDto.rating
                })
            );
        } catch (error) {
            console.error('Failed to update user stats:', error.message);
            // We don't want to fail the review creation if stats update fails
        }

        return review;
    }

    findAll() {
        return this.prisma.review.findMany();
    }

    findOne(id: string) {
        return this.prisma.review.findUnique({
            where: { id },
        });
    }

    findByReviewee(reviewee_id: string) {
        return this.prisma.review.findMany({
            where: { reviewee_id },
        });
    }

    update(id: string, updateReviewDto: UpdateReviewDto) {
        return this.prisma.review.update({
            where: { id },
            data: updateReviewDto,
        });
    }

    remove(id: string) {
        return this.prisma.review.delete({
            where: { id },
        });
    }
}
