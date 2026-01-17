import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CloudsService {
    constructor(private prisma: PrismaService, private http: HttpService) { }

    async createCloud(data: { name: string; description?: string; ownerId: string; visibility?: 'PRIVATE' | 'PUBLIC'; costCenter?: string; budget?: number }) {
        const cloud = await this.prisma.talentCloud.create({
            data: {
                name: data.name,
                description: data.description,
                ownerId: data.ownerId,
                visibility: data.visibility,
                costCenter: data.costCenter,
                budget: data.budget || 0,
            }
        });
        // add owner as member with OWNER role
        await this.prisma.talentCloudMember.create({
            data: { cloudId: cloud.id, userId: data.ownerId, role: 'OWNER' },
        });
        // notify user-service about ownership badge
        await this.notifyUserService(data.ownerId, { hasCloudOwnership: true });
        return cloud;
    }

    async addMember(cloudId: string, userId: string, role: 'ADMIN' | 'MEMBER' = 'MEMBER') {
        const member = await this.prisma.talentCloudMember.create({
            data: { cloudId, userId, role },
        });
        await this.notifyUserService(userId, { isCloudMember: true, cloudId });
        return member;
    }

    async removeMember(cloudId: string, userId: string) {
        await this.prisma.talentCloudMember.deleteMany({ where: { cloudId, userId } });
        await this.notifyUserService(userId, { isCloudMember: false, cloudId });
        return { success: true };
    }

    async listCloudsForUser(userId: string) {
        return this.prisma.talentCloudMember.findMany({ where: { userId }, include: { cloud: true } });
    }

    async getCloud(cloudId: string) {
        const cloud = await this.prisma.talentCloud.findUnique({
            where: { id: cloudId },
            include: { members: true },
        });

        if (!cloud) return null;

        // Enrich members with user profiles from user-service
        const enrichedMembers = await Promise.all(
            cloud.members.map(async (member) => {
                try {
                    const profile = await this.getUserProfile(member.userId);
                    return { ...member, userProfile: profile };
                } catch (err) {
                    return { ...member, userProfile: { id: member.userId, firstName: 'User', lastName: member.userId.slice(0, 4) } };
                }
            }),
        );

        return { ...cloud, members: enrichedMembers };
    }

    async updateCloud(cloudId: string, data: { name?: string; description?: string; visibility?: 'PRIVATE' | 'PUBLIC'; costCenter?: string; budget?: number }) {
        return this.prisma.talentCloud.update({
            where: { id: cloudId },
            data: {
                name: data.name,
                description: data.description,
                visibility: data.visibility,
                costCenter: data.costCenter,
                budget: data.budget,
            }
        });
    }

    private async getUserProfile(userId: string) {
        const url = `${process.env.USER_SERVICE_INTERNAL_URL || process.env.USER_SERVICE_URL}/api/users/${userId}`;
        const res = await firstValueFrom(this.http.get(url));
        return res.data;
    }

    private async notifyUserService(userId: string, payload: any) {
        const url = `${process.env.USER_SERVICE_URL}/api/users/${userId}/cloud-membership`;
        return firstValueFrom(this.http.patch(url, payload));
    }
}
