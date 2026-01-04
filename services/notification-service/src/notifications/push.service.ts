import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as webpush from 'web-push';
import { PushSubscription, PushSubscriptionDocument } from './schemas/push-subscription.schema';

@Injectable()
export class PushService {
    private readonly logger = new Logger(PushService.name);

    constructor(
        private configService: ConfigService,
        @InjectModel(PushSubscription.name)
        private subscriptionModel: Model<PushSubscriptionDocument>,
    ) {
        const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY', 'BOdcfnA0k9gD38QQtgU2UX-CMkqLOKoHu30xNdeF_DockAaOveiGy2E-7xs-DW9WyBalDc9Rr-1SZdtrWVrimys');
        const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY', 'KyK_71JyU43ArRp16MXaoo_XyXu6lFzcRBI6ZTbgcyY');
        const subject = this.configService.get<string>('VAPID_SUBJECT', 'mailto:admin@example.com');

        webpush.setVapidDetails(subject, publicKey, privateKey);
    }

    async addSubscription(userId: string, deviceFingerprint: string, subscription: any): Promise<PushSubscription> {
        return this.subscriptionModel.findOneAndUpdate(
            { userId, deviceFingerprint },
            { userId, deviceFingerprint, subscription },
            { upsert: true, new: true }
        ).exec();
    }

    async removeSubscription(userId: string, deviceFingerprint: string): Promise<void> {
        await this.subscriptionModel.deleteOne({ userId, deviceFingerprint }).exec();
    }

    async sendNotification(userId: string, payload: any): Promise<void> {
        const subscriptions = await this.subscriptionModel.find({ userId }).exec();

        const notifications = subscriptions.map(async (sub) => {
            try {
                await webpush.sendNotification(sub.subscription as any, JSON.stringify(payload));
            } catch (error: any) {
                if (error.statusCode === 410 || error.statusCode === 404) {
                    // Subscription expired or gone
                    await this.subscriptionModel.deleteOne({ _id: sub._id }).exec();
                    this.logger.log(`Removed expired subscription for user ${userId}`);
                } else {
                    this.logger.error(`Failed to send push to user ${userId}: ${error.message}`);
                }
            }
        });

        await Promise.all(notifications);
    }
}
