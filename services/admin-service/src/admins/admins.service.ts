import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
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
    async approveJob(jobId: string) {
        const jobServiceUrl = this.configService.get<string>('JOB_SERVICE_URL', 'http://localhost:3002');
        const res = await firstValueFrom(
            this.httpService.post(`${jobServiceUrl}/jobs/${jobId}/approve`)
        );
        return res.data;
    }

    async rejectJob(jobId: string) {
        const jobServiceUrl = this.configService.get<string>('JOB_SERVICE_URL', 'http://localhost:3002');
        const res = await firstValueFrom(
            this.httpService.post(`${jobServiceUrl}/jobs/${jobId}/reject`)
        );
        return res.data;
    }

    // User Moderation Proxy
    async suspendUser(userId: string) {
        const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL', 'http://localhost:3001');
        const res = await firstValueFrom(
            this.httpService.post(`${userServiceUrl}/users/${userId}/suspend`)
        );
        return res.data;
    }

    async banUser(userId: string) {
        const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL', 'http://localhost:3001');
        const res = await firstValueFrom(
            this.httpService.post(`${userServiceUrl}/users/${userId}/ban`)
        );
        return res.data;
    }

    async activateUser(userId: string) {
        const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL', 'http://localhost:3001');
        const res = await firstValueFrom(
            this.httpService.post(`${userServiceUrl}/users/${userId}/activate`)
        );
        return res.data;
    }

    // Job Moderation
    async lockJob(jobId: string) {
        const jobServiceUrl = this.configService.get<string>('JOB_SERVICE_URL', 'http://localhost:3002');
        const res = await firstValueFrom(
            this.httpService.post(`${jobServiceUrl}/jobs/${jobId}/lock`)
        );
        return res.data;
    }

    async unlockJob(jobId: string) {
        const jobServiceUrl = this.configService.get<string>('JOB_SERVICE_URL', 'http://localhost:3002');
        const res = await firstValueFrom(
            this.httpService.post(`${jobServiceUrl}/jobs/${jobId}/unlock`)
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
    async getSystemMetrics() {
        try {
            const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL', 'http://localhost:3001');
            const jobServiceUrl = this.configService.get<string>('JOB_SERVICE_URL', 'http://localhost:3002');
            const paymentServiceUrl = this.configService.get<string>('PAYMENT_SERVICE_URL', 'http://localhost:3005');

            const [usersRes, jobsRes, paymentsRes] = await Promise.all([
                firstValueFrom(this.httpService.get(`${userServiceUrl}/users`)),
                firstValueFrom(this.httpService.get(`${jobServiceUrl}/jobs`)),
                firstValueFrom(this.httpService.get(`${paymentServiceUrl}/payments/metrics`))
            ]);

            const users = usersRes.data;
            const jobs = jobsRes.data;
            const payments = paymentsRes.data;

            return {
                totalUsers: users.length,
                totalJobs: jobs.length,
                pendingJobs: jobs.filter(j => j.status === 'PENDING_APPROVAL').length,
                activeJobs: jobs.filter(j => j.status === 'OPEN').length,
                suspendedUsers: users.filter(u => u.status === 'SUSPENDED').length,
                totalVolume: payments.totalVolume,
                totalPayments: payments.totalPayments
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
    async exportData(type: 'users' | 'jobs' | 'transactions') {
        let data: any[] = [];
        let fields: string[] = [];

        try {
            if (type === 'users') {
                const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL', 'http://localhost:3001');
                const res = await firstValueFrom(this.httpService.get(`${userServiceUrl}/users`));
                data = res.data;
                fields = ['id', 'email', 'firstName', 'lastName', 'role', 'status', 'createdAt'];
            } else if (type === 'jobs') {
                const jobServiceUrl = this.configService.get<string>('JOB_SERVICE_URL', 'http://localhost:3002');
                const res = await firstValueFrom(this.httpService.get(`${jobServiceUrl}/jobs`));
                data = res.data;
                fields = ['id', 'title', 'budget', 'status', 'clientId', 'createdAt'];
            } else if (type === 'transactions') {
                // For MVP, we don't have a direct "all transactions" endpoint in payment service exposed yet
                // We'll mock this or fetch from a new endpoint if we had time
                // Let's just return empty for now or fetch metrics
                return 'id,amount,type,status,createdAt\n';
            }

            if (data.length === 0) return '';

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
}
