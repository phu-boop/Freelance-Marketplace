import { Controller, Get, Post, Body, Param, Delete, Request } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobAlertDto } from './dto/create-job-alert.dto';
import { Roles, Public } from 'nest-keycloak-connect';

@Controller('api/jobs/alerts')
export class AlertsController {
    constructor(private readonly jobsService: JobsService) { }

    @Post()
    @Roles({ roles: ['realm:FREELANCER'] })
    create(@Request() req, @Body() createJobAlertDto: CreateJobAlertDto) {
        const userId = req.user.sub;
        return this.jobsService.createAlert(userId, createJobAlertDto);
    }

    @Get()
    @Roles({ roles: ['realm:FREELANCER'] })
    findAll(@Request() req) {
        const userId = req.user.sub;
        return this.jobsService.findAlertsByUser(userId);
    }

    @Delete(':id')
    @Roles({ roles: ['realm:FREELANCER'] })
    remove(@Request() req, @Param('id') id: string) {
        const userId = req.user.sub;
        return this.jobsService.removeAlert(userId, id);
    }
}
