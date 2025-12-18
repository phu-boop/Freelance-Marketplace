import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectModel(Notification.name)
        private notificationModel: Model<Notification>,
    ) { }

    async create(
        createNotificationDto: CreateNotificationDto,
    ): Promise<Notification> {
        const createdNotification = new this.notificationModel(
            createNotificationDto,
        );
        return createdNotification.save();
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
