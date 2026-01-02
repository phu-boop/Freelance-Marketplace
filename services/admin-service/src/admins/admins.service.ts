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
                // For MVP, we don't have a direct "all transactions" endpoint in payment service exposed yet
                // We'll mock this or fetch from a new endpoint if we had time
                // Let's just return empty for now or fetch metrics
                return 'id,amount,type,status,createdAt\n';
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
}
