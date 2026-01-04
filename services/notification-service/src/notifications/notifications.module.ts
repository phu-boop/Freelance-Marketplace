import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { PushService } from './push.service';
import { NotificationsController } from './notifications.controller';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { HttpModule } from '@nestjs/axios';
import { PushSubscription, PushSubscriptionSchema } from './schemas/push-subscription.schema';
import { Integration, IntegrationSchema } from './schemas/integration.schema';
import { NotificationGateway } from './notifications.gateway';
import { IntegrationService } from './integration.service';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: Notification.name, schema: NotificationSchema },
            { name: PushSubscription.name, schema: PushSubscriptionSchema },
            { name: Integration.name, schema: IntegrationSchema },
        ]),
    ],
    controllers: [NotificationsController],
    providers: [NotificationsService, PushService, IntegrationService, NotificationGateway],
    exports: [NotificationsService, PushService, IntegrationService],
})
export class NotificationsModule { }
