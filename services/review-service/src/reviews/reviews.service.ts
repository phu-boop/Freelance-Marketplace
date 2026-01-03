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

    async addReply(id: string, reply: string, userId: string) {
        const review = await this.prisma.review.findUnique({
            where: { id },
        });

        if (!review) {
            throw new Error('Review not found');
        }

        if (review.reviewee_id !== userId) {
            throw new Error('You can only reply to reviews received by you');
        }

        return this.prisma.review.update({
            where: { id },
            data: {
                reply,
                repliedAt: new Date(),
            },
        });
    }

    async reportReview(id: string, reporterId: string, reason: string) {
        const review = await this.prisma.review.findUnique({
            where: { id },
        });

        if (!review) {
            throw new Error('Review not found');
        }

        const adminServiceUrl = this.configService.get<string>('ADMIN_SERVICE_URL', 'http://admin-service:3009');

        try {
            const res = await firstValueFrom(
                this.httpService.post(`${adminServiceUrl}/api/public/reports`, {
                    reporterId,
                    targetId: id,
                    type: 'REVIEW',
                    reason,
                })
            );
            return res.data;
        } catch (error) {
            console.error('Failed to report review to admin-service:', error.message);
            throw new Error('Failed to submit report');
        }
    }

    async requestReview(contractId: string, freelancerId: string, clientId: string, freelancerName: string) {
        // Send Notification to Client
        try {
            const notificationUrl = this.configService.get<string>('NOTIFICATION_SERVICE_URL', 'http://notification-service:3007');
            await firstValueFrom(
                this.httpService.post(notificationUrl, {
                    userId: clientId,
                    type: 'REVIEW_REQUESTED',
                    title: 'Review Requested',
                    message: `Freelancer ${freelancerName} has requested a review for your project.`,
                    metadata: {
                        contractId,
                    }
                })
            );
            return { success: true };
        } catch (error) {
            console.error('Failed to send review request notification:', error.message);
            throw new Error('Failed to send request');
        }
    }

    remove(id: string) {
        return this.prisma.review.delete({
            where: { id },
        });
    }
}
