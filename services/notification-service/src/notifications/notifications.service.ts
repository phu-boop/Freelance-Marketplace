import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './schemas/notification.schema';
import { PushService } from './push.service';
import { IntegrationService } from './integration.service';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectModel(Notification.name)
        private notificationModel: Model<Notification>,
        private pushService: PushService,
        private integrationService: IntegrationService,
    ) { }

    async create(
        createNotificationDto: CreateNotificationDto,
    ): Promise<Notification> {
        const createdNotification = new this.notificationModel(
            createNotificationDto,
        );
        const saved = await createdNotification.save();

        // Dispatch Web Push
        // Ensure payload is small and simple
        const payload = {
            title: createNotificationDto.title,
            body: createNotificationDto.message,
            url: createNotificationDto.link || '/',
            data: { id: saved._id }
        };
        await this.pushService.sendNotification(createNotificationDto.userId, payload);

        // Dispatch Integrations (Slack/Discord)
        await this.integrationService.dispatch(createNotificationDto.userId, {
            title: createNotificationDto.title,
            message: createNotificationDto.message,
            link: createNotificationDto.link,
            type: createNotificationDto.type
        });

        return saved;
    }

    async addPushSubscription(userId: string, fingerprint: string, sub: any) {
        return this.pushService.addSubscription(userId, fingerprint, sub);
    }

    async removePushSubscription(userId: string, fingerprint: string) {
        return this.pushService.removeSubscription(userId, fingerprint);
    }

    async addIntegration(userId: string, data: any) {
        return this.integrationService.create(userId, data);
    }

    async getIntegrations(userId: string) {
        return this.integrationService.findAll(userId);
    }

    async removeIntegration(userId: string, id: string) {
        return this.integrationService.remove(userId, id);
    }

    async findAll(): Promise<Notification[]> {
        return this.notificationModel.find().sort({ createdAt: -1 }).exec();
    }

    async findByUserId(userId: string): Promise<Notification[]> {
        return this.notificationModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .exec();
    }

    async markAsRead(id: string): Promise<Notification | null> {
        return this.notificationModel
            .findByIdAndUpdate(id, { isRead: true }, { new: true })
            .exec();
    }

    async remove(id: string): Promise<any> {
        return this.notificationModel.findByIdAndDelete(id).exec();
    }
}
