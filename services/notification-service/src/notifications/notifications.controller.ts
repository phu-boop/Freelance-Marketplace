import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('api/notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Post()
    create(@Body() createNotificationDto: CreateNotificationDto) {
        return this.notificationsService.create(createNotificationDto);
    }

    @Get()
    findAll(@Query('userId') userId?: string) {
        if (userId) {
            return this.notificationsService.findByUserId(userId);
        }
        return this.notificationsService.findAll();
    }

    @Patch(':id/read')
    markAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.notificationsService.remove(id);
    }

    @Post('push/subscribe')
    subscribeToPush(@Body() body: { userId: string, deviceFingerprint: string, subscription: any }) {
        return this.notificationsService.addPushSubscription(body.userId, body.deviceFingerprint, body.subscription);
    }

    @Post('push/unsubscribe')
    unsubscribeFromPush(@Body() body: { userId: string, deviceFingerprint: string }) {
        return this.notificationsService.removePushSubscription(body.userId, body.deviceFingerprint);
    }

    @Post('integrations')
    addIntegration(@Body() body: { userId: string, provider: 'slack' | 'discord', webhookUrl: string, events?: string[] }) {
        return this.notificationsService.addIntegration(body.userId, body);
    }

    @Get('integrations')
    getIntegrations(@Query('userId') userId: string) {
        return this.notificationsService.getIntegrations(userId);
    }

    @Delete('integrations/:id')
    removeIntegration(@Query('userId') userId: string, @Param('id') id: string) {
        return this.notificationsService.removeIntegration(userId, id);
    }
}
