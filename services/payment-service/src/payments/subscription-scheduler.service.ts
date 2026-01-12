import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionSchedulerService {
    private readonly logger = new Logger(SubscriptionSchedulerService.name);

    constructor(
        private prisma: PrismaService,
        private paymentsService: PaymentsService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleSubscriptionRenewals() {
        this.logger.log('Starting subscription renewal processing...');

        const today = new Date();

        const expiringSubscriptions = await this.prisma.subscription.findMany({
            where: {
                status: 'ACTIVE',
                nextBillingDate: { lte: today },
            },
        });

        this.logger.log(`Found ${expiringSubscriptions.length} subscriptions candidate for renewal`);

        for (const sub of expiringSubscriptions) {
            try {
                this.logger.log(`Renewing subscription ${sub.id} for user ${sub.userId}`);

                // Use createSubscription logic but specifically for renewal
                // In a real app, we might have a dedicated renewSubscription method
                await this.paymentsService.createSubscription(sub.userId, {
                    planId: sub.planId,
                    price: Number(sub.price)
                });

                // Deactivate old subscription
                await this.prisma.subscription.update({
                    where: { id: sub.id },
                    data: { status: 'EXPIRED' }
                });

                this.logger.log(`Successfully renewed subscription for user ${sub.userId}`);
            } catch (error) {
                this.logger.error(
                    `Failed to renew subscription for user ${sub.userId}: ${error.message}`,
                );
                // If renewal fails (e.g. insufficient funds), mark as PAST_DUE
                await this.prisma.subscription.update({
                    where: { id: sub.id },
                    data: { status: 'PAST_DUE' }
                });
            }
        }

        this.logger.log('Finished subscription renewal processing.');
    }
}
