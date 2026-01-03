import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { Roles } from 'nest-keycloak-connect';

@Controller('api/interviews')
export class InterviewsController {
    constructor(private readonly jobsService: JobsService) { }

    @Post()
    @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
    create(@Body() dto: any, @Request() req) {
        const userId = req.user.sub;
        return this.jobsService.scheduleInterview(userId, dto);
    }

    @Get()
    findAll(@Query('role') role: string, @Request() req) {
        const userId = req.user.sub;
        return this.jobsService.getInterviews(userId, role);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: any, @Request() req) {
        const userId = req.user.sub;
        return this.jobsService.updateInterview(id, userId, dto);
    }

    @Post(':id/start-call')
    startCall(@Param('id') id: string, @Request() req) {
        const userId = req.user.sub;
        return this.jobsService.startMeeting(id, userId);
    }
}
