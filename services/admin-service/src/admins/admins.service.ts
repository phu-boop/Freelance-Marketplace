import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminsService {
    constructor(
        private prisma: PrismaService,
        private httpService: HttpService,
        private configService: ConfigService
    ) { }

    create(createAdminDto: CreateAdminDto) {
        return this.prisma.admin.create({
            data: createAdminDto,
        });
    }

    findAll() {
        return this.prisma.admin.findMany();
    }

    findOne(id: string) {
        return this.prisma.admin.findUnique({
            where: { id },
        });
    }

    update(id: string, updateAdminDto: UpdateAdminDto) {
        return this.prisma.admin.update({
            where: { id },
            data: updateAdminDto,
        });
    }

    remove(id: string) {
        return this.prisma.admin.delete({
            where: { id },
        });
    }

    // Job Moderation Proxy
    async approveJob(jobId: string, token?: string) {
        const jobServiceUrl = this.configService.get<string>('JOB_SERVICE_URL', 'http://localhost:3002');
        const res = await firstValueFrom(
            this.httpService.post(`${jobServiceUrl}/api/jobs/${jobId}/approve`, {}, {
                headers: token ? { Authorization: token } : undefined
            })
        );
        return res.data;
    }

    async rejectJob(jobId: string, token?: string) {
        const jobServiceUrl = this.configService.get<string>('JOB_SERVICE_URL', 'http://localhost:3002');
        const res = await firstValueFrom(
            this.httpService.post(`${jobServiceUrl}/api/jobs/${jobId}/reject`, {}, {
                headers: token ? { Authorization: token } : undefined
            })
        );
        return res.data;
    }

    // User Moderation Proxy
    async suspendUser(userId: string, token?: string) {
        const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL', 'http://localhost:3001');
        const res = await firstValueFrom(
            this.httpService.post(`${userServiceUrl}/${userId}/suspend`, {}, {
                headers: token ? { Authorization: token } : undefined
            })
        );
        return res.data;
    }

    async banUser(userId: string, token?: string) {
        const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL', 'http://localhost:3001');
        const res = await firstValueFrom(
            this.httpService.post(`${userServiceUrl}/${userId}/ban`, {}, {
                headers: token ? { Authorization: token } : undefined
            })
        );
        return res.data;
    }

    async activateUser(userId: string, token?: string) {
        const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL', 'http://localhost:3001');
        const res = await firstValueFrom(
            this.httpService.post(`${userServiceUrl}/${userId}/activate`, {}, {
                headers: token ? { Authorization: token } : undefined
            })
        );
        return res.data;
    }

    async verifyKyc(userId: string, data: { status: 'APPROVED' | 'REJECTED', reason?: string }, token?: string) {
        const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL', 'http://localhost:3001');
        const res = await firstValueFrom(
            this.httpService.post(`${userServiceUrl}/${userId}/kyc/verify`, data, {
                headers: token ? { Authorization: token } : undefined
            })
        );

        await this.logAction('INFO', 'ADMIN', `KYC ${data.status} for user ${userId}`, { reason: data.reason });
        return res.data;
    }

    // Job Moderation
    async lockJob(jobId: string, token?: string) {
        const jobServiceUrl = this.configService.get<string>('JOB_SERVICE_URL', 'http://localhost:3002');
        const res = await firstValueFrom(
            this.httpService.post(`${jobServiceUrl}/api/jobs/${jobId}/lock`, {}, {
                headers: token ? { Authorization: token } : undefined
            })
        );
        return res.data;
    }

    async unlockJob(jobId: string, token?: string) {
        const jobServiceUrl = this.configService.get<string>('JOB_SERVICE_URL', 'http://localhost:3002');
        const res = await firstValueFrom(
            this.httpService.post(`${jobServiceUrl}/api/jobs/${jobId}/unlock`, {}, {
                headers: token ? { Authorization: token } : undefined
            })
        );
        return res.data;
    }

    // System Configuration
    async setConfig(key: string, value: string) {
        return this.prisma.systemConfig.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });
    }

    async getConfig(key: string) {
        return this.prisma.systemConfig.findUnique({
            where: { key },
        });
    }

    async getAllConfigs() {
        return this.prisma.systemConfig.findMany();
    }

    // System Logging
    async logAction(level: string, service: string, message: string, metadata?: any) {
        return this.prisma.systemLog.create({
            data: {
                level,
                service,
                message,
                metadata: metadata ? JSON.stringify(metadata) : undefined,
            },
        });
    }

    async getLogs(limit = 50, offset = 0) {
        return this.prisma.systemLog.findMany({
            take: limit,
            skip: offset,
            orderBy: { timestamp: 'desc' },
        });
    }

    // System Metrics
    async getSystemMetrics(token?: string) {
        try {
            const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL', 'http://localhost:3001');
            const jobServiceUrl = this.configService.get<string>('JOB_SERVICE_URL', 'http://localhost:3002');
            const paymentServiceUrl = this.configService.get<string>('PAYMENT_SERVICE_URL', 'http://localhost:3005');

            const config = token ? { headers: { Authorization: token } } : undefined;

            const [usersRes, jobsRes, paymentsRes] = await Promise.all([
                firstValueFrom(this.httpService.get(`${userServiceUrl}/`, config)),
                firstValueFrom(this.httpService.get(`${jobServiceUrl}/api/jobs`, config)),
                firstValueFrom(this.httpService.get(`${paymentServiceUrl}/metrics`, config))
            ]);

            const users = usersRes.data;
            const jobs = jobsRes.data;
            const payments = paymentsRes.data;

            return {
                totalUsers: Array.isArray(users) ? users.length : 0,
                totalJobs: Array.isArray(jobs) ? jobs.length : 0,
                pendingJobs: Array.isArray(jobs) ? jobs.filter(j => j.status === 'PENDING_APPROVAL').length : 0,
                activeJobs: Array.isArray(jobs) ? jobs.filter(j => j.status === 'OPEN').length : 0,
                suspendedUsers: Array.isArray(users) ? users.filter(u => u.status === 'SUSPENDED').length : 0,
                totalVolume: payments?.totalVolume || 0,
                totalPayments: payments?.totalPayments || 0
            };
        } catch (error) {
            console.error('Failed to fetch system metrics:', error.message);
            return {
                totalUsers: 0,
                totalJobs: 0,
                pendingJobs: 0,
                activeJobs: 0,
                suspendedUsers: 0
            };
        }
    }

    // Reporting System
    async createReport(data: { reporterId: string; targetId: string; type: string; reason: string }) {
        return this.prisma.report.create({
            data: {
                reporterId: data.reporterId,
                targetId: data.targetId,
                type: data.type,
                reason: data.reason,
            },
        });
    }

    async getReports(status?: string) {
        return this.prisma.report.findMany({
            where: status ? { status } : undefined,
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateReportStatus(id: string, status: string) {
        return this.prisma.report.update({
            where: { id },
            data: { status },
        });
    }

    // Data Export
    async exportData(type: 'users' | 'jobs' | 'transactions', token?: string) {
        let data: any[] = [];
        let fields: string[] = [];
        const config = token ? { headers: { Authorization: token } } : undefined;

        try {
            if (type === 'users') {
                const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL', 'http://localhost:3001');
                const res = await firstValueFrom(this.httpService.get(`${userServiceUrl}/`, config));
                data = res.data;
                fields = ['id', 'email', 'firstName', 'lastName', 'role', 'status', 'createdAt'];
            } else if (type === 'jobs') {
                const jobServiceUrl = this.configService.get<string>('JOB_SERVICE_URL', 'http://localhost:3002');
                const res = await firstValueFrom(this.httpService.get(`${jobServiceUrl}/api/jobs`, config));
                data = res.data;
                fields = ['id', 'title', 'budget', 'status', 'clientId', 'createdAt'];
            } else if (type === 'transactions') {
                const paymentServiceUrl = this.configService.get<string>('PAYMENT_SERVICE_URL', 'http://localhost:3005');
                const res = await firstValueFrom(this.httpService.get(`${paymentServiceUrl}/transactions?limit=1000`, config));
                data = res.data;
                fields = ['id', 'amount', 'type', 'status', 'createdAt', 'referenceId', 'walletId'];
            }

            if (!Array.isArray(data) || data.length === 0) return '';

            const header = fields.join(',');
            const rows = data.map(row => {
                return fields.map(field => {
                    const val = row[field] || '';
                    return `"${val}"`;
                }).join(',');
            });

            return [header, ...rows].join('\n');
        } catch (error) {
            console.error(`Failed to export ${type}`, error);
            throw new Error(`Failed to export ${type}`);
        }
    }

    // Support System
    async createTicket(userId: string, data: { subject: string; message: string; category?: string; priority?: string }) {
        return this.prisma.supportTicket.create({
            data: {
                userId,
                subject: data.subject,
                message: data.message,
                category: data.category || 'GENERAL',
                priority: data.priority || 'NORMAL',
            },
        });
    }

    async getTickets(status?: string, assignedTo?: string) {
        const where: any = {};
        if (status) where.status = status;
        if (assignedTo) where.assignedTo = assignedTo;

        return this.prisma.supportTicket.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    async resolveTicket(id: string, adminId: string, resolutionNote: string) {
        return this.prisma.supportTicket.update({
            where: { id },
            data: {
                status: 'RESOLVED',
                assignedTo: adminId,
                resolutionNote,
            },
        });
    }

    async updateTicketStatus(id: string, status: string, adminId?: string) {
        return this.prisma.supportTicket.update({
            where: { id },
            data: {
                status,
                ...(adminId && { assignedTo: adminId })
            },
        });
    }

    async getUserTickets(userId: string) {
        return this.prisma.supportTicket.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    // Warnings
    async sendWarning(userId: string, reason: string, adminId: string) {
        // 1. Log warning
        const warning = await this.prisma.warning.create({
            data: {
                userId,
                reason,
                adminId,
            }
        });

        // 2. Notify user (Cross-service)
        try {
            const notificationUrl = this.configService.get<string>('NOTIFICATION_SERVICE_URL', 'http://notification-service:3007');
            await firstValueFrom(
                this.httpService.post(`${notificationUrl}/api/notifications`, {
                    userId,
                    type: 'WARNING',
                    title: 'Account Warning',
                    message: `You have received a warning: ${reason}`,
                    metadata: { warningId: warning.id }
                })
            );
        } catch (error) {
            console.error('Failed to send warning notification', error.message);
        }

        // 3. Log Audit
        await this.logAction('WARN', 'ADMIN', `Issued warning to user ${userId}: ${reason}`, { adminId, userId });

        return warning;
    }

    async getAuditLogs(limit = 50, offset = 0) {
        return this.prisma.auditLog.findMany({
            take: Number(limit),
            skip: Number(offset),
            orderBy: { createdAt: 'desc' }
        });
    }

    // Bulk Actions
    async bulkUserAction(userIds: string[], action: 'SUSPEND' | 'ACTIVATE' | 'DELETE', adminId: string, token?: string) {
        const results: { success: string[]; failed: { userId: string; error: any }[] } = {
            success: [],
            failed: []
        };

        const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL', 'http://localhost:3001');
        const config = token ? { headers: { Authorization: token } } : undefined;

        for (const userId of userIds) {
            try {
                if (action === 'SUSPEND') {
                    await firstValueFrom(this.httpService.post(`${userServiceUrl}/${userId}/suspend`, {}, config));
                } else if (action === 'ACTIVATE') {
                    await firstValueFrom(this.httpService.post(`${userServiceUrl}/${userId}/activate`, {}, config));
                }
                // Action DELETE typically not supported directly for users in this demo, usually soft delete or ban
                results.success.push(userId);
            } catch (error) {
                console.error(`Failed to ${action} user ${userId}`, error.message);
                results.failed.push({ userId, error: error.message });
            }
        }

        await this.logAction('INFO', 'ADMIN', `Bulk ${action} executed by ${adminId}`, { count: results.success.length, action });

        return results;
    }

    async handleChargeback(transactionId: string, adminId: string, token?: string) {
        const paymentServiceUrl = this.configService.get<string>('PAYMENT_SERVICE_URL', 'http://localhost:3005');
        const config = token ? { headers: { Authorization: token } } : undefined;

        await firstValueFrom(
            this.httpService.post(`${paymentServiceUrl}/transactions/${transactionId}/chargeback`, {}, config)
        );

        await this.logAction('WARN', 'ADMIN', `Chargeback processed for transaction ${transactionId} by ${adminId}`, { transactionId, adminId });
        return { success: true };
    }

    // Taxes
    async createTaxSetting(data: any, token?: string) {
        const paymentServiceUrl = this.configService.get<string>('PAYMENT_SERVICE_URL', 'http://localhost:3005');
        const config = token ? { headers: { Authorization: token } } : undefined;
        const res = await firstValueFrom(this.httpService.post(`${paymentServiceUrl}/taxes`, data, config));
        return res.data;
    }

    async getTaxSettings(token?: string) {
        const paymentServiceUrl = this.configService.get<string>('PAYMENT_SERVICE_URL', 'http://localhost:3005');
        const config = token ? { headers: { Authorization: token } } : undefined;
        const res = await firstValueFrom(this.httpService.get(`${paymentServiceUrl}/taxes`, config));
        return res.data;
    }

    async updateTaxSetting(id: string, data: any, token?: string) {
        const paymentServiceUrl = this.configService.get<string>('PAYMENT_SERVICE_URL', 'http://localhost:3005');
        const config = token ? { headers: { Authorization: token } } : undefined;
        const res = await firstValueFrom(this.httpService.put(`${paymentServiceUrl}/taxes/${id}`, data, config));
        return res.data;
    }

    // Analytics Proxy
    async getRetentionStats(token?: string) {
        const analyticsServiceUrl = this.configService.get<string>('ANALYTICS_SERVICE_URL', 'http://localhost:8000');
        // Analytics service might not use Keycloak token, but we pass it if needed or omit.
        // For Python FastAPI, valid CORS/Auth might be different. Assuming internal trust or public for now.
        const res = await firstValueFrom(this.httpService.get(`${analyticsServiceUrl}/analytics/retention`));
        return res.data;
    }

    async getChurnStats(token?: string) {
        const analyticsServiceUrl = this.configService.get<string>('ANALYTICS_SERVICE_URL', 'http://localhost:8000');
        const res = await firstValueFrom(this.httpService.get(`${analyticsServiceUrl}/analytics/churn`));
        return res.data;
    }

    async getSystemPerformance(token?: string) {
        const analyticsServiceUrl = this.configService.get<string>('ANALYTICS_SERVICE_URL', 'http://localhost:8000');
        const res = await firstValueFrom(this.httpService.get(`${analyticsServiceUrl}/analytics/performance`));
        return res.data;
    }

    // Scheduled Reports
    async createScheduledReport(adminId: string, data: { reportType: string; frequency: string; email: string }) {
        return this.prisma.scheduledReport.create({
            data: {
                adminId,
                reportType: data.reportType,
                frequency: data.frequency,
                email: data.email,
            }
        });
    }

    async deleteScheduledReport(id: string) {
        return this.prisma.scheduledReport.delete({ where: { id } });
    }

    async getScheduledReports(adminId: string) {
        return this.prisma.scheduledReport.findMany({ where: { adminId } });
    }

    // Cron Job: Runs every hour to check for due reports
    @Cron(CronExpression.EVERY_HOUR)
    async handleCron() {
        // Find reports due
        // Logic: 
        // If DAILY -> lastSentAt < 24h ago or null
        // If WEEKLY -> lastSentAt < 7d ago or null
        const now = new Date();
        const reports = await this.prisma.scheduledReport.findMany();

        for (const report of reports) {
            let shouldSend = false;

            if (!report.lastSentAt) {
                shouldSend = true;
            } else {
                const diff = now.getTime() - new Date(report.lastSentAt).getTime();
                const hours = diff / (1000 * 60 * 60);

                if (report.frequency === 'DAILY' && hours >= 24) shouldSend = true;
                if (report.frequency === 'WEEKLY' && hours >= 168) shouldSend = true;
            }

            if (shouldSend) {
                await this.sendReport(report);
            }
        }
    }

    async sendReport(report: any) {
        try {
            // 1. Generate Report Data
            let content = '';
            if (report.reportType === 'DAILY_SUMMARY') {
                const stats = await this.getSystemMetrics();
                content = `Daily Summary:\nTotal Users: ${stats.totalUsers}\nActive Jobs: ${stats.activeJobs}`;
            } else if (report.reportType === 'WEEKLY_METRICS') {
                const retention = await this.getRetentionStats();
                content = `Weekly Metrics:\nRetention Data: ${JSON.stringify(retention)}`;
            }

            // 2. Send Email (via Notification Service)
            // Assuming Notification Service has a generic email endpoint or we simulate it
            const notificationUrl = this.configService.get<string>('NOTIFICATION_SERVICE_URL', 'http://notification-service:3007');
            await firstValueFrom(
                this.httpService.post(`${notificationUrl}/api/notifications`, {
                    userId: report.adminId, // Send to admin
                    type: 'SYSTEM',
                    title: `Scheduled Report: ${report.reportType}`,
                    message: content,
                    metadata: { type: 'REPORT', email: report.email }
                })
            );

            // 3. Update lastSentAt
            await this.prisma.scheduledReport.update({
                where: { id: report.id },
                data: { lastSentAt: new Date() }
            });

            console.log(`Sent report ${report.id} to ${report.email}`);
        } catch (error) {
            console.error(`Failed to send report ${report.id}`, error);
        }
    }

    // Static Pages
    async createOrUpdatePage(key: string, data: { title: string; content: string; isPublished?: boolean }) {
        return this.prisma.staticPage.upsert({
            where: { key },
            update: { ...data },
            create: { key, ...data },
        });
    }

    async getPage(key: string) {
        return this.prisma.staticPage.findUnique({ where: { key } });
    }

    async getPages() {
        return this.prisma.staticPage.findMany();
    }

    // Email Templates
    async createEmailTemplate(data: { name: string; subject: string; body: string }) {
        return this.prisma.emailTemplate.create({ data });
    }

    async getEmailTemplates() {
        return this.prisma.emailTemplate.findMany();
    }

    async updateEmailTemplate(id: string, data: { name?: string; subject?: string; body?: string }) {
        return this.prisma.emailTemplate.update({
            where: { id },
            data
        });
    }

    async deleteEmailTemplate(id: string) {
        return this.prisma.emailTemplate.delete({ where: { id } });
    }

    // Feature Flags
    async createFeatureFlag(data: { key: string; description?: string; isEnabled?: boolean; percentage?: number; allowedUsers?: string[] }) {
        return this.prisma.featureFlag.create({ data });
    }

    async getFeatureFlags() {
        return this.prisma.featureFlag.findMany();
    }

    async updateFeatureFlag(id: string, data: { description?: string; isEnabled?: boolean; percentage?: number; allowedUsers?: string[] }) {
        return this.prisma.featureFlag.update({
            where: { id },
            data
        });
    }

    async deleteFeatureFlag(id: string) {
        return this.prisma.featureFlag.delete({ where: { id } });
    }

    async getFeatureFlagByKey(key: string) {
        return this.prisma.featureFlag.findUnique({ where: { key } });
    }

    // System Backup & Restore
    async createBackup(adminId: string) {
        try {
            const backupDir = path.join(process.cwd(), 'storage', 'backups');
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }

            // Dump data (JSON Export of critical tables)
            // In a real app, use pg_dump. Here we export JSON for simplicity.
            const data = {
                timestamp: new Date(),
                configs: await this.prisma.systemConfig.findMany(),
                emailTemplates: await this.prisma.emailTemplate.findMany(),
                featureFlags: await this.prisma.featureFlag.findMany(),
                staticPages: await this.prisma.staticPage.findMany(),
                integrations: await this.prisma.integration.findMany(),
            };

            const filename = `backup_${Date.now()}.json`;
            const filepath = path.join(backupDir, filename);
            const content = JSON.stringify(data, null, 2);

            fs.writeFileSync(filepath, content);
            const stats = fs.statSync(filepath);

            return this.prisma.systemBackup.create({
                data: {
                    filename,
                    size: stats.size,
                    createdBy: adminId,
                }
            });
        } catch (error) {
            console.error('Backup failed:', error);
            throw new Error('Backup failed');
        }
    }

    async getBackups() {
        return this.prisma.systemBackup.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    async downloadBackup(id: string) {
        const backup = await this.prisma.systemBackup.findUnique({ where: { id } });
        if (!backup) throw new Error('Backup not found');

        const filepath = path.join(process.cwd(), 'storage', 'backups', backup.filename);
        if (!fs.existsSync(filepath)) throw new Error('File not found');

        return {
            filename: backup.filename,
            path: filepath
        };
    }

    async restoreBackup(id: string) {
        // Stub logic: Read file and log contents. 
        // Real restoration requires careful dependency handling.
        const backup = await this.prisma.systemBackup.findUnique({ where: { id } });
        if (!backup) throw new Error('Backup not found');

        const filepath = path.join(process.cwd(), 'storage', 'backups', backup.filename);
        if (!fs.existsSync(filepath)) throw new Error('File not found');

        const content = fs.readFileSync(filepath, 'utf-8');
        const data = JSON.parse(content);

        // Example: Restore Configs
        if (data.configs) {
            for (const config of data.configs) {
                await this.prisma.systemConfig.upsert({
                    where: { key: config.key },
                    update: { value: config.value },
                    create: { key: config.key, value: config.value }
                });
            }
        }

        return { success: true, message: 'Configuration restored successfully. Full restore not implemented.' };
    }

    // Integrations
    async createIntegration(data: { name: string; provider: string; credentials: any }) {
        return this.prisma.integration.create({
            data: {
                name: data.name,
                provider: data.provider,
                credentials: data.credentials // Should be encrypted
            }
        });
    }

    async getIntegrations() {
        return this.prisma.integration.findMany();
    }

    async updateIntegration(id: string, data: { status?: string; credentials?: any }) {
        return this.prisma.integration.update({
            where: { id },
            data
        });
    }

    async deleteIntegration(id: string) {
        return this.prisma.integration.delete({ where: { id } });
    }
}
