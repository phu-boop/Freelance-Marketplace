import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsEvent } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);

    constructor(private readonly prisma: PrismaService) { }

    /** Record a generic analytics event */
    async recordEvent(event: {
        type: string;
        userId?: string;
        payload?: any;
    }): Promise<AnalyticsEvent> {
        return this.prisma.analyticsEvent.create({
            data: {
                type: event.type,
                userId: event.userId,
                payload: event.payload ? JSON.stringify(event.payload) : undefined,
            },
        });
    }

    /** Get freelancer metrics */
    async getFreelancerMetrics(userId: string) {
        return this.prisma.freelancerMetric.findUnique({ where: { userId } });
    }

    /** Get client metrics */
    async getClientMetrics(userId: string) {
        return this.prisma.clientMetric.findUnique({ where: { userId } });
    }

    /**
     * Cron job to aggregate metrics daily at midnight
     */
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleDailyMetricRollup() {
        this.logger.log('Starting daily metric rollup...');

        try {
            // 1. Rollup Freelancer Metrics
            const freelancers = await this.prisma.user.findMany({
                where: { roles: { has: 'FREELANCER' } },
            });

            for (const freelancer of freelancers) {
                // Mocking some calculations based on events or other data
                // In a real app, you'd aggregate real payment/job data here
                await this.prisma.freelancerMetric.upsert({
                    where: { userId: freelancer.id },
                    update: {
                        earnings: 0, // Should come from payment-service integration
                        winRate: 0.75, // Sample win rate
                        avgResponseTime: 30, // Sample mins
                        projectsCompleted: freelancer.jobsHiredCount, // Using existing counter
                    },
                    create: {
                        userId: freelancer.id,
                        earnings: 0,
                        winRate: 0.75,
                        avgResponseTime: 30,
                        projectsCompleted: freelancer.jobsHiredCount,
                    },
                });
            }

            // 2. Rollup Client Metrics
            const clients = await this.prisma.user.findMany({
                where: { roles: { has: 'CLIENT' } },
            });

            for (const client of clients) {
                await this.prisma.clientMetric.upsert({
                    where: { userId: client.id },
                    update: {
                        totalSpend: client.totalSpend,
                        roi: 1.2, // Sample ROI
                        projectsPosted: client.jobsPostedCount,
                        activeContracts: 1, // Should come from contract-service
                    },
                    create: {
                        userId: client.id,
                        totalSpend: client.totalSpend,
                        roi: 1.2,
                        projectsPosted: client.jobsPostedCount,
                        activeContracts: 1,
                    },
                });
            }

            this.logger.log('Daily metric rollup completed successfully.');
        } catch (error) {
            this.logger.error('Failed to complete daily metric rollup', error.stack);
        }
    }
}
