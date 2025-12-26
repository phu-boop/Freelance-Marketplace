import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Controller('admins')
export class AdminsController {
    constructor(private readonly adminsService: AdminsService) { }

    @Post()
    create(@Body() createAdminDto: CreateAdminDto) {
        return this.adminsService.create(createAdminDto);
    }

    @Get()
    findAll() {
        return this.adminsService.findAll();
    }

    @Get('metrics')
    getSystemMetrics() {
        return this.adminsService.getSystemMetrics();
    }

    @Get('configs')
    getAllConfigs() {
        return this.adminsService.getAllConfigs();
    }

    @Post('configs')
    setConfig(@Body() body: { key: string; value: string }) {
        return this.adminsService.setConfig(body.key, body.value);
    }

    @Get('logs')
    getLogs() {
        return this.adminsService.getLogs();
    }

    @Post('reports')
    createReport(@Body() body: { reporterId: string; targetId: string; type: string; reason: string }) {
        return this.adminsService.createReport(body);
    }

    @Get('reports')
    getReports(@Query('status') status?: string) {
        return this.adminsService.getReports(status);
    }

    @Patch('reports/:id/status')
    updateReportStatus(@Param('id') id: string, @Body() body: { status: string }) {
        return this.adminsService.updateReportStatus(id, body.status);
    }

    @Get('export/:type')
    async exportData(@Param('type') type: 'users' | 'jobs' | 'transactions', @Res() res: Response) {
        const csv = await this.adminsService.exportData(type);
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', `attachment; filename=${type}.csv`);
        res.send(csv);
    }

    @Post('jobs/:id/approve')
    approveJob(@Param('id') id: string) {
        return this.adminsService.approveJob(id);
    }

    @Post('jobs/:id/reject')
    rejectJob(@Param('id') id: string) {
        return this.adminsService.rejectJob(id);
    }

    @Post('users/:id/suspend')
    suspendUser(@Param('id') id: string) {
        return this.adminsService.suspendUser(id);
    }

    @Post('users/:id/ban')
    banUser(@Param('id') id: string) {
        return this.adminsService.banUser(id);
    }

    @Post('users/:id/activate')
    activateUser(@Param('id') id: string) {
        return this.adminsService.activateUser(id);
    }

    @Post('jobs/:id/lock')
    lockJob(@Param('id') id: string) {
        return this.adminsService.lockJob(id);
    }

    @Post('jobs/:id/unlock')
    unlockJob(@Param('id') id: string) {
        return this.adminsService.unlockJob(id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.adminsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
        return this.adminsService.update(id, updateAdminDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.adminsService.remove(id);
    }
}
