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
            data: { cloudId: cloud.id, userId: data.ownerId, role: 'OWNER', status: 'ACTIVE' },
        });
        // notify user-service about ownership badge
        await this.notifyUserService(data.ownerId, { hasCloudOwnership: true });
        return cloud;
    }

    async getCloudsForUser(userId: string) {
        return this.prisma.talentCloud.findMany({
            where: {
                members: {
                    some: {
                        userId: userId,
                        status: 'ACTIVE'
                    }
                }
            },
            include: {
                _count: {
                    select: { members: true }
                }
            }
        });
    }

    async inviteMember(cloudId: string, inviteeId: string, inviterId: string) {
        // Create invitation
        const invitation = await this.prisma.talentCloudInvitation.create({
            data: {
                cloudId,
                inviteeId,
                inviterId,
                status: 'PENDING',
            }
        });

        // Add member with INVITED status
        await this.prisma.talentCloudMember.upsert({
            where: { cloudId_userId: { cloudId, userId: inviteeId } },
            update: { status: 'INVITED' },
            create: { cloudId, userId: inviteeId, status: 'INVITED' }
        });

        return invitation;
    }

    async respondToInvitation(invitationId: string, userId: string, accept: boolean) {
        const invitation = await this.prisma.talentCloudInvitation.findUnique({
            where: { id: invitationId }
        });

        if (!invitation || invitation.inviteeId !== userId) {
            throw new Error('Invitation not found or unauthorized');
        }

        if (accept) {
            await this.prisma.talentCloudInvitation.update({
                where: { id: invitationId },
                data: { status: 'ACCEPTED' }
            });

            await this.prisma.talentCloudMember.update({
                where: { cloudId_userId: { cloudId: invitation.cloudId, userId } },
                data: { status: 'ACTIVE' }
            });

            await this.notifyUserService(userId, { isCloudMember: true, cloudId: invitation.cloudId });
        } else {
            await this.prisma.talentCloudInvitation.update({
                where: { id: invitationId },
                data: { status: 'REJECTED' }
            });

            await this.prisma.talentCloudMember.delete({
                where: { cloudId_userId: { cloudId: invitation.cloudId, userId } }
            });
        }

        return { success: true };
    }

    async getInvitations(userId: string) {
        return this.prisma.talentCloudInvitation.findMany({
            where: { inviteeId: userId, status: 'PENDING' },
            include: { cloud: true }
        });
    }

    async addMember(cloudId: string, userId: string, role: 'ADMIN' | 'MEMBER' = 'MEMBER') {
        const cloud = await this.prisma.talentCloud.findUnique({
            where: { id: cloudId },
            include: { policies: true }
        });

        if (!cloud) throw new Error('Cloud not found');

        // Check policies
        if (cloud.policies.length > 0) {
            const userProfile = await this.getUserProfile(userId);
            for (const policy of cloud.policies) {
                if (policy.type === 'REQUIRED_BADGE' && policy.isActive) {
                    const config = policy.config as any;
                    const requiredBadge = config?.badge;
                    const hasBadge = userProfile.badges?.some((b: any) => b.name === requiredBadge || b.slug === requiredBadge);
                    if (!hasBadge) {
                        throw new Error(`User does not have the required badge: ${requiredBadge}`);
                    }
                }
            }
        }

        const member = await this.prisma.talentCloudMember.upsert({
            where: { cloudId_userId: { cloudId, userId } },
            update: { role, status: 'ACTIVE' },
            create: { cloudId, userId, role, status: 'ACTIVE' },
        });
        await this.notifyUserService(userId, { isCloudMember: true, cloudId }).catch(() => { });
        return member;
    }

    async addMembersBulk(cloudId: string, userIds: string[], role: 'ADMIN' | 'MEMBER' = 'MEMBER') {
        const cloud = await this.prisma.talentCloud.findUnique({
            where: { id: cloudId },
            include: { policies: true }
        });

        if (!cloud) throw new Error('Cloud not found');

        const successfulUserIds: string[] = [];
        const errors: any[] = [];

        for (const userId of userIds) {
            try {
                // Check policies for each user
                if (cloud.policies.length > 0) {
                    const userProfile = await this.getUserProfile(userId);
                    for (const policy of cloud.policies) {
                        if (policy.type === 'REQUIRED_BADGE' && policy.isActive) {
                            const config = policy.config as any;
                            const requiredBadge = config?.badge;
                            const hasBadge = userProfile.badges?.some((b: any) => b.name === requiredBadge || b.slug === requiredBadge);
                            if (!hasBadge) {
                                throw new Error(`User ${userId} does not have the required badge: ${requiredBadge}`);
                            }
                        }
                    }
                }

                await this.prisma.talentCloudMember.upsert({
                    where: { cloudId_userId: { cloudId, userId } },
                    update: { role, status: 'ACTIVE' },
                    create: { cloudId, userId, role, status: 'ACTIVE' }
                });
                successfulUserIds.push(userId);
            } catch (err) {
                errors.push({ userId, error: err.message });
            }
        }

        // Notify successful in parallel
        await Promise.all(successfulUserIds.map(userId =>
            this.notifyUserService(userId, { isCloudMember: true, cloudId }).catch(() => { })
        ));

        return { successfulCount: successfulUserIds.length, errors };
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

    async createBudget(cloudId: string, amount: number, fiscalYear: string) {
        // In a real implementation this would write to a Budget table
        // For Gap Filling Phase, we simulate this logic
        const budget = {
            id: `budget-${Date.now()}`,
            cloudId,
            totalAmount: amount,
            allocatedAmount: 0,
            remainingAmount: amount,
            currency: 'USD',
            fiscalYear,
            status: 'ACTIVE'
        };
        // await this.prisma.budget.create({ data: budget });
        return budget;
    }

    async getBudget(cloudId: string) {
        // Mock return
        return {
            id: 'mock-budget-id',
            cloudId,
            totalAmount: 100000,
            allocatedAmount: 25000,
            remainingAmount: 75000,
            currency: 'USD',
            fiscalYear: '2026',
            status: 'ACTIVE'
        };
    }
}
