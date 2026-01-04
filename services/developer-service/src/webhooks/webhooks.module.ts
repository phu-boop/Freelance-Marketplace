import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { WebhooksService } from './webhooks.service';
import { WebhooksController } from './webhooks.controller';
import { WebhookProcessor } from './webhook.processor';

@Module({
    imports: [
        HttpModule,
        BullModule.registerQueue({
            name: 'webhooks',
        }),
    ],
    providers: [WebhooksService, WebhookProcessor],
    controllers: [WebhooksController],
    exports: [WebhooksService],
})
export class WebhooksModule { }
