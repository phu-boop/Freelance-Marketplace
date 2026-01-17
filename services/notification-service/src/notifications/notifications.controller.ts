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

import { AuthenticatedUser, Public, Roles } from 'nest-keycloak-connect';

@Controller('api/notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Public()
    @Post()
    create(@Body() createNotificationDto: CreateNotificationDto) {
        return this.notificationsService.create(createNotificationDto);
    }

    @Get()
    findAll(@AuthenticatedUser() user: any) {
        return this.notificationsService.findByUserId(user.sub);
    }

    @Get('all')
    @Roles({ roles: ['realm:ADMIN'] })
    getAll() {
        return this.notificationsService.findAll();
    }

    @Patch(':id/read')
    markAsRead(@Param('id') id: string, @AuthenticatedUser() user: any) {
        return this.notificationsService.markAsRead(id, user.sub);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @AuthenticatedUser() user: any) {
        return this.notificationsService.remove(id, user.sub);
    }

    @Post('push/subscribe')
    subscribeToPush(@AuthenticatedUser() user: any, @Body() body: { deviceFingerprint: string, subscription: any }) {
        return this.notificationsService.addPushSubscription(user.sub, body.deviceFingerprint, body.subscription);
    }

    @Post('push/unsubscribe')
    unsubscribeFromPush(@AuthenticatedUser() user: any, @Body() body: { deviceFingerprint: string }) {
        return this.notificationsService.removePushSubscription(user.sub, body.deviceFingerprint);
    }

    @Post('integrations')
    addIntegration(@AuthenticatedUser() user: any, @Body() body: { provider: 'slack' | 'discord', webhookUrl: string, events?: string[] }) {
        return this.notificationsService.addIntegration(user.sub, body);
    }

    @Get('integrations')
    getIntegrations(@AuthenticatedUser() user: any) {
        return this.notificationsService.getIntegrations(user.sub);
    }

    @Delete('integrations/:id')
    removeIntegration(@AuthenticatedUser() user: any, @Param('id') id: string) {
        return this.notificationsService.removeIntegration(user.sub, id);
    }
}
