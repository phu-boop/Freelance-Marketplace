import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
    private readonly logger = new Logger(ReviewsService.name);

    constructor(
        private prisma: PrismaService,
        private httpService: HttpService,
        private configService: ConfigService
    ) { }

    async create(createReviewDto: CreateReviewDto) {
        // Check for duplicate
        const existing = await this.prisma.review.findFirst({
            where: {
                reviewer_id: createReviewDto.reviewer_id,
                contract_id: createReviewDto.contract_id
            }
        });
        if (existing) {
            throw new Error('You have already submitted a review for this contract');
        }

        // Look for opposing review (if the other party already reviewed)
        const opposing = await this.prisma.review.findFirst({
            where: {
                reviewer_id: createReviewDto.reviewee_id,
                reviewee_id: createReviewDto.reviewer_id,
                contract_id: createReviewDto.contract_id,
                status: 'PENDING'
            }
        });

        const status = opposing ? 'RELEASED' : 'PENDING';
        const revealedAt = opposing ? new Date() : null;

        const review = await this.prisma.review.create({
            data: {
                ...createReviewDto,
                status: status as any,
                revealedAt,
            },
        });

        if (opposing) {
            // Both reviews submitted! Reveal both.
            await this.prisma.review.update({
                where: { id: opposing.id },
                data: {
                    status: 'RELEASED' as any,
                    revealedAt: new Date(),
                },
            });

            // Trigger user stats update for both parties
            await Promise.all([
                this.triggerStatsUpdate(review.reviewee_id, review.ratingOverall),
                this.triggerStatsUpdate(opposing.reviewee_id, opposing.ratingOverall),
                this.logToAnalytics(review.reviewee_id, review.ratingOverall, review.contract_id),
                this.logToAnalytics(opposing.reviewee_id, opposing.ratingOverall, opposing.contract_id)
            ]);
        }

        return review;
    }

    private async triggerStatsUpdate(userId: string, rating: number) {
        try {
            const userServiceUrl = this.configService.get<string>('USER_SERVICE_INTERNAL_URL', 'http://user-service:3000/api/users');
            await firstValueFrom(
                this.httpService.post(`${userServiceUrl}/${userId}/stats`, {
                    rating
                })
            );
        } catch (error) {
            console.error(`Failed to update user stats for ${userId}:`, error.message);
        }
    }

    findAll() {
        return this.prisma.review.findMany({
            where: { status: 'RELEASED' as any }
        });
    }

    findOne(id: string) {
        return this.prisma.review.findUnique({
            where: { id },
        });
    }

    findByReviewee(reviewee_id: string) {
        return this.prisma.review.findMany({
            where: {
                reviewee_id,
                status: 'RELEASED' as any
            },
            orderBy: { createdAt: 'desc' }
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

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleAutoRelease() {
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        const expiredReviews = await this.prisma.review.findMany({
            where: {
                status: 'PENDING' as any,
                createdAt: { lte: fourteenDaysAgo }
            }
        });

        this.logger.log(`Found ${expiredReviews.length} expired pending reviews to auto-release`);

        for (const review of expiredReviews) {
            try {
                await this.prisma.review.update({
                    where: { id: review.id },
                    data: {
                        status: 'RELEASED' as any,
                        revealedAt: new Date(),
                    }
                });

                await this.triggerStatsUpdate(review.reviewee_id, review.ratingOverall);

                // Log to analytics
                await this.logToAnalytics(review.reviewee_id, review.ratingOverall, review.contract_id);

                this.logger.log(`Auto-released review ${review.id} for user ${review.reviewee_id}`);
            } catch (error) {
                this.logger.error(`Failed to auto-release review ${review.id}: ${error.message}`);
            }
        }
    }

    private async logToAnalytics(userId: string, rating: number, contractId: string) {
        try {
            const analyticsUrl = this.configService.get<string>('ANALYTICS_SERVICE_URL', 'http://analytics-service:3014');
            await firstValueFrom(
                this.httpService.post(`${analyticsUrl}/api/analytics/events`, {
                    event_type: 'review_received',
                    user_id: userId,
                    job_id: contractId,
                    metadata: JSON.stringify({ rating })
                })
            );
        } catch (error) {
            console.error('Failed to log review to analytics:', error.message);
        }
    }

    remove(id: string) {
        return this.prisma.review.delete({
            where: { id },
        });
    }
}
