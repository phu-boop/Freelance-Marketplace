import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './schemas/notification.schema';
import { PushService } from './push.service';
import { IntegrationService } from './integration.service';
import { NotificationGateway } from './notifications.gateway';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectModel(Notification.name)
        private notificationModel: Model<Notification>,
        private pushService: PushService,
        private integrationService: IntegrationService,
        private notificationGateway: NotificationGateway,
        private httpService: HttpService,
        private configService: ConfigService,
    ) { }

    async create(
        createNotificationDto: CreateNotificationDto,
    ): Promise<Notification> {
        const createdNotification = new this.notificationModel(
            createNotificationDto,
        );
        // Fetch user preferences
        let userPrefs = { inAppNotifications: true, pushNotifications: true, emailNotifications: true };
        try {
            const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL', 'http://user-service:3001');
            const { data: user } = await firstValueFrom(this.httpService.get(`${userServiceUrl}/api/users/${createNotificationDto.userId}`));
            userPrefs = {
                inAppNotifications: user.inAppNotifications ?? true,
                pushNotifications: user.pushNotifications ?? true,
                emailNotifications: user.emailNotifications ?? true,
            };
        } catch (err) {
            console.error('Failed to fetch user preferences, defaulting to enabled', err.message);
        }

        const saved = await createdNotification.save();

        // Dispatch Real-time (Socket.io)
        if (userPrefs.inAppNotifications) {
            this.notificationGateway.sendNotification(createNotificationDto.userId, saved);
        }

        // Dispatch Web Push
        if (userPrefs.pushNotifications) {
            const payload = {
                title: createNotificationDto.title,
                body: createNotificationDto.message,
                url: createNotificationDto.link || '/',
                data: { id: saved._id }
            };
            await this.pushService.sendNotification(createNotificationDto.userId, payload);
        }

        // Dispatch Integrations (Slack/Discord) - Always dispatch if active, or we could add a specific pref
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

    async markAsRead(id: string, userId: string): Promise<Notification | null> {
        return this.notificationModel
            .findOneAndUpdate({ _id: id, userId }, { isRead: true }, { new: true })
            .exec();
    }

    async remove(id: string, userId: string): Promise<any> {
        return this.notificationModel.findOneAndDelete({ _id: id, userId }).exec();
    }
}
