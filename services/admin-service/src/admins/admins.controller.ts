import {
    Controller,
    Get,
    Put,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    Res,
    Request,
} from '@nestjs/common';
import type { Response } from 'express';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Roles } from 'nest-keycloak-connect';

@Controller('api/admins')
@Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
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
    getSystemMetrics(@Request() req: any) {
        const token = req.headers.authorization;
        return this.adminsService.getSystemMetrics(token);
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
    async exportData(@Param('type') type: 'users' | 'jobs' | 'transactions', @Res() res: Response, @Request() req: any) {
        const token = req.headers.authorization;
        const csv = await this.adminsService.exportData(type, token);
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', `attachment; filename=${type}.csv`);
        res.send(csv);
    }

    @Post('jobs/:id/approve')
    approveJob(@Param('id') id: string, @Request() req: any) {
        const token = req.headers.authorization;
        return this.adminsService.approveJob(id, token);
    }

    @Post('jobs/:id/reject')
    rejectJob(@Param('id') id: string, @Request() req: any) {
        const token = req.headers.authorization;
        return this.adminsService.rejectJob(id, token);
    }

    @Post('users/:id/suspend')
    suspendUser(@Param('id') id: string, @Request() req: any) {
        const token = req.headers.authorization;
        return this.adminsService.suspendUser(id, token);
    }

    @Post('users/:id/ban')
    banUser(@Param('id') id: string, @Request() req: any) {
        const token = req.headers.authorization;
        return this.adminsService.banUser(id, token);
    }

    @Post('users/:id/activate')
    activateUser(@Param('id') id: string, @Request() req: any) {
        const token = req.headers.authorization;
        return this.adminsService.activateUser(id, token);
    }

    @Post('jobs/:id/lock')
    lockJob(@Param('id') id: string, @Request() req: any) {
        const token = req.headers.authorization;
        return this.adminsService.lockJob(id, token);
    }

    @Post('jobs/:id/unlock')
    unlockJob(@Param('id') id: string, @Request() req: any) {
        const token = req.headers.authorization;
        return this.adminsService.unlockJob(id, token);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.adminsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
        return this.adminsService.update(id, updateAdminDto);
    }

    @Get('support/tickets')
    getTickets(@Query('status') status?: string, @Query('assignedTo') assignedTo?: string) {
        return this.adminsService.getTickets(status, assignedTo);
    }

    @Get('support/my-tickets')
    @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER', 'realm:ADMIN', 'ADMIN'] })
    getMyTickets(@Request() req: any) {
        const userId = req.user.sub;
        return this.adminsService.getUserTickets(userId);
    }

    @Post('support/tickets')
    @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER', 'realm:ADMIN', 'ADMIN'] })
    createTicket(@Body() body: { subject: string; message: string; category?: string; priority?: string }, @Request() req: any) {
        const userId = req.user.sub;
        return this.adminsService.createTicket(userId, body);
    }

    @Post('support/tickets/:id/resolve')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    resolveTicket(@Param('id') id: string, @Body() body: { resolutionNote: string }, @Request() req: any) {
        const adminId = req.user.sub;
        return this.adminsService.resolveTicket(id, adminId, body.resolutionNote);
    }

    @Patch('support/tickets/:id/status')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    updateTicketStatus(@Param('id') id: string, @Body() body: { status: string; assignedTo?: string }) {
        return this.adminsService.updateTicketStatus(id, body.status, body.assignedTo);
    }

    @Post('users/warnings')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    sendWarning(@Body() body: { userId: string; reason: string }, @Request() req: any) {
        const adminId = req.user.sub;
        return this.adminsService.sendWarning(body.userId, body.reason, adminId);
    }

    @Get('audit-logs')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    getAuditLogs(@Query('limit') limit: number, @Query('offset') offset: number) {
        return this.adminsService.getAuditLogs(limit, offset);
    }

    @Post('users/bulk-action')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    bulkUserAction(@Body() body: { userIds: string[]; action: 'SUSPEND' | 'ACTIVATE' | 'DELETE' }, @Request() req: any) {
        const adminId = req.user.sub;
        const token = req.headers.authorization;
        return this.adminsService.bulkUserAction(body.userIds, body.action, adminId, token);
    }

    @Post('configs/payment-gateways')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async setPaymentGatewayConfig(@Body() body: { provider: string; keys: any }, @Request() req: any) {
        const adminId = req.user.sub;
        // In a real app, encrypt 'keys' before storing
        const key = `GATEWAY_${body.provider.toUpperCase()}`;
        return this.adminsService.setConfig(key, JSON.stringify(body.keys));
    }

    @Post('payments/chargebacks')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async processChargeback(@Body() body: { transactionId: string }, @Request() req: any) {
        const adminId = req.user.sub;
        const token = req.headers.authorization;
        return this.adminsService.handleChargeback(body.transactionId, adminId, token);
    }

    @Post('taxes')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async createTax(@Body() body: any, @Request() req: any) {
        const token = req.headers.authorization;
        return this.adminsService.createTaxSetting(body, token);
    }

    @Get('taxes')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async getTaxes(@Request() req: any) {
        const token = req.headers.authorization;
        return this.adminsService.getTaxSettings(token);
    }

    @Put('taxes/:id')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async updateTax(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        const token = req.headers.authorization;
        return this.adminsService.updateTaxSetting(id, body, token);
    }

    @Get('analytics/retention')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async getRetention(@Request() req: any) {
        const token = req.headers.authorization;
        return this.adminsService.getRetentionStats(token);
    }

    @Get('analytics/churn')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async getChurn(@Request() req: any) {
        const token = req.headers.authorization;
        return this.adminsService.getChurnStats(token);
    }

    @Get('analytics/performance')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async getPerformance(@Request() req: any) {
        const token = req.headers.authorization;
        return this.adminsService.getSystemPerformance(token);
    }

    @Post('reports/schedules')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async createScheduledReport(@Body() body: { reportType: string; frequency: string; email: string }, @Request() req: any) {
        const adminId = req.user.sub;
        return this.adminsService.createScheduledReport(adminId, body);
    }

    @Delete('reports/schedules/:id')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async deleteScheduledReport(@Param('id') id: string) {
        return this.adminsService.deleteScheduledReport(id);
    }

    @Get('reports/schedules')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async getScheduledReports(@Request() req: any) {
        const adminId = req.user.sub;
        return this.adminsService.getScheduledReports(adminId);
    }

    @Post('pages')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async createPage(@Body() body: { key: string; title: string; content: string; isPublished?: boolean }) {
        return this.adminsService.createOrUpdatePage(body.key, body);
    }

    @Get('pages')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async getPages() {
        return this.adminsService.getPages();
    }

    @Post('email-templates')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async createEmailTemplate(@Body() body: { name: string; subject: string; body: string }) {
        return this.adminsService.createEmailTemplate(body);
    }

    @Get('email-templates')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async getEmailTemplates() {
        return this.adminsService.getEmailTemplates();
    }

    @Put('email-templates/:id')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async updateEmailTemplate(@Param('id') id: string, @Body() body: { name?: string; subject?: string; body?: string }) {
        return this.adminsService.updateEmailTemplate(id, body);
    }

    @Delete('email-templates/:id')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async deleteEmailTemplate(@Param('id') id: string) {
        return this.adminsService.deleteEmailTemplate(id);
    }

    @Post('feature-flags')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async createFeatureFlag(@Body() body: { key: string; description?: string; isEnabled?: boolean; percentage?: number; allowedUsers?: string[] }) {
        return this.adminsService.createFeatureFlag(body);
    }

    @Get('feature-flags')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async getFeatureFlags() {
        return this.adminsService.getFeatureFlags();
    }

    @Put('feature-flags/:id')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async updateFeatureFlag(@Param('id') id: string, @Body() body: { description?: string; isEnabled?: boolean; percentage?: number; allowedUsers?: string[] }) {
        return this.adminsService.updateFeatureFlag(id, body);
    }

    @Delete('feature-flags/:id')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async deleteFeatureFlag(@Param('id') id: string) {
        return this.adminsService.deleteFeatureFlag(id);
    }

    @Post('backups')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async createBackup(@Request() req: any) {
        const adminId = req.user.sub;
        return this.adminsService.createBackup(adminId);
    }

    @Get('backups')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async getBackups() {
        return this.adminsService.getBackups();
    }

    @Get('backups/:id/download')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async downloadBackup(@Param('id') id: string, @Res() res: Response) {
        const file = await this.adminsService.downloadBackup(id);
        res.download(file.path, file.filename);
    }

    @Post('backups/:id/restore')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async restoreBackup(@Param('id') id: string) {
        return this.adminsService.restoreBackup(id);
    }

    @Post('integrations')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async createIntegration(@Body() body: { name: string; provider: string; credentials: any }) {
        return this.adminsService.createIntegration(body);
    }

    @Get('integrations')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async getIntegrations() {
        return this.adminsService.getIntegrations();
    }

    @Put('integrations/:id')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async updateIntegration(@Param('id') id: string, @Body() body: { status?: string; credentials?: any }) {
        return this.adminsService.updateIntegration(id, body);
    }

    @Delete('integrations/:id')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async deleteIntegration(@Param('id') id: string) {
        return this.adminsService.deleteIntegration(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.adminsService.remove(id);
    }
}
