import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminsService {
    constructor(
        private prisma: PrismaService,
        private httpService: HttpService
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
        const res = await firstValueFrom(
            this.httpService.post(`http://localhost:3002/jobs/${jobId}/approve`)
        );
        return res.data;
    }

    async rejectJob(jobId: string) {
        const res = await firstValueFrom(
            this.httpService.post(`http://localhost:3002/jobs/${jobId}/reject`)
        );
        return res.data;
    }

    // User Moderation Proxy
    async suspendUser(userId: string) {
        const res = await firstValueFrom(
            this.httpService.post(`http://localhost:3001/users/${userId}/suspend`)
        );
        return res.data;
    }

    async banUser(userId: string) {
        const res = await firstValueFrom(
            this.httpService.post(`http://localhost:3001/users/${userId}/ban`)
        );
        return res.data;
    }

    // System Metrics
    async getSystemMetrics() {
        try {
            const [usersRes, jobsRes] = await Promise.all([
                firstValueFrom(this.httpService.get('http://localhost:3001/users')),
                firstValueFrom(this.httpService.get('http://localhost:3002/jobs'))
            ]);

            const users = usersRes.data;
            const jobs = jobsRes.data;

            return {
                totalUsers: users.length,
                totalJobs: jobs.length,
                pendingJobs: jobs.filter(j => j.status === 'PENDING_APPROVAL').length,
                activeJobs: jobs.filter(j => j.status === 'OPEN').length,
                suspendedUsers: users.filter(u => u.status === 'SUSPENDED').length
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
}
