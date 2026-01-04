import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { Public } from 'nest-keycloak-connect';

@Controller('api/public')
export class PublicController {
    constructor(private readonly adminsService: AdminsService) { }

    @Get('configs/:key')
    @Public()
    async getConfig(@Param('key') key: string) {
        const config = await this.adminsService.getConfig(key);
        if (!config) {
            throw new NotFoundException(`Config with key ${key} not found`);
        }
        return config;
    }

    @Post('reports')
    @Public()
    async createReport(@Body() body: { reporterId: string; targetId: string; type: string; reason: string }) {
        return this.adminsService.createReport(body);
    }

    @Get('pages/:key')
    @Public()
    async getPage(@Param('key') key: string) {
        const page = await this.adminsService.getPage(key);
        if (!page || !page.isPublished) {
            throw new NotFoundException(`Page with key ${key} not found`);
        }
        return page;
    }

    @Get('feature-flags')
    @Public()
    async getFeatureFlags() {
        const flags = await this.adminsService.getFeatureFlags();
        return flags.map(f => ({ key: f.key, isEnabled: f.isEnabled, percentage: f.percentage }));
    }
}
