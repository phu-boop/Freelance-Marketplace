import { Controller, Get, Post, Body, Param, Delete, Request } from '@nestjs/common';
import { WebhooksService } from './webhooks.service';

@Controller('api/developer/webhooks')
export class WebhooksController {
    constructor(private readonly webhooksService: WebhooksService) { }

    @Post('dispatch')
    dispatch(@Body() data: { event: string; payload: any }) {
        return this.webhooksService.dispatch(data.event, data.payload);
    }

    @Post()
    subscribe(@Request() req: any, @Body() data: { appId: string; targetUrl: string; events: string[] }) {
        const userId = req.user?.sub || 'test-user';
        return this.webhooksService.subscribe(userId, data);
    }

    @Get('app/:appId')
    findAll(@Request() req: any, @Param('appId') appId: string) {
        const userId = req.user?.sub || 'test-user';
        return this.webhooksService.findAllByApp(appId, userId);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        const userId = req.user?.sub || 'test-user';
        return this.webhooksService.delete(id, userId);
    }
}
