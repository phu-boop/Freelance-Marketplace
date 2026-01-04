
import { Controller, Post, Body, Param, Get, Patch, Request } from '@nestjs/common';
import { TimesheetsService } from './timesheets.service';
import { Roles } from 'nest-keycloak-connect';

@Controller('api/timesheets')
export class TimesheetsController {
    constructor(private readonly timesheetsService: TimesheetsService) { }

    @Get('contract/:id')
    @Roles({ roles: ['realm:FREELANCER', 'realm:CLIENT'] })
    async getTimesheets(@Request() req, @Param('id') id: string) {
        return this.timesheetsService.getTimesheets(id, req.user.sub);
    }

    @Post('contract/:id')
    @Roles({ roles: ['realm:FREELANCER'] })
    async addTimeEntry(@Request() req, @Param('id') id: string, @Body() body: any) {
        return this.timesheetsService.addTimeEntry(id, req.user.sub, body);
    }

    @Get(':id')
    @Roles({ roles: ['realm:FREELANCER', 'realm:CLIENT'] })
    async getTimesheetById(@Request() req, @Param('id') id: string) {
        return this.timesheetsService.getTimesheetById(id, req.user.sub);
    }

    @Patch('timesheets/:id/submit')
    @Roles({ roles: ['realm:FREELANCER'] })
    async submitTimesheet(@Request() req, @Param('id') id: string) {
        return this.timesheetsService.submitTimesheet(id, req.user.sub);
    }

    @Patch('timesheets/:id/approve')
    @Roles({ roles: ['realm:CLIENT'] })
    async approveTimesheet(@Request() req, @Param('id') id: string) {
        return this.timesheetsService.approveTimesheet(id, req.user.sub);
    }

    @Get('reports/time-summary')
    @Roles({ roles: ['realm:FREELANCER'] })
    async getTimeSummary(@Request() req) {
        return this.timesheetsService.getTimeSummary(req.user.sub);
    }
}
