import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AppsService } from './apps.service';

@Controller('api/developer/apps')
export class AppsController {
    constructor(private readonly appsService: AppsService) { }

    @Post()
    create(@Request() req: any, @Body() data: { name: string; redirectUris: string[] }) {
        const userId = req.user?.sub || 'test-user'; // TODO: Proper Auth
        return this.appsService.create(userId, data);
    }

    @Get()
    findAll(@Request() req: any) {
        const userId = req.user?.sub || 'test-user';
        return this.appsService.findAllByOwner(userId);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        const userId = req.user?.sub || 'test-user';
        return this.appsService.findOne(id, userId);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        const userId = req.user?.sub || 'test-user';
        return this.appsService.delete(id, userId);
    }
}
