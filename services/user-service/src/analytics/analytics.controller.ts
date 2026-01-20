import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from 'nest-keycloak-connect';

@Controller('api/analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Post('event')
    async recordEvent(@Body() event: { type: string; userId?: string; payload?: any }) {
        return this.analyticsService.recordEvent(event);
    }

    @Get('freelancer/:id')
    @Roles({ roles: ['realm:FREELANCER', 'realm:ADMIN'] })
    async getFreelancerMetrics(@Param('id') userId: string) {
        return this.analyticsService.getFreelancerMetrics(userId);
    }

    @Get('client/:id')
    @Roles({ roles: ['realm:CLIENT', 'realm:ADMIN'] })
    async getClientMetrics(@Param('id') userId: string) {
        return this.analyticsService.getClientMetrics(userId);
    }

    @Get('platform')
    @Roles({ roles: ['realm:ADMIN'] })
    async getPlatformMetrics() {
        // For now, return basic platform stats. This could be expanded.
        return {
            status: 'active',
            timestamp: new Date().toISOString(),
            // Add more platform-wide KPIs here
        };
    }
}
