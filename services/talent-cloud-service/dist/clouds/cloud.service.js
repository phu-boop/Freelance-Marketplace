"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let CloudService = class CloudService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCloud(data) {
        const cloud = await this.prisma.talentCloud.create({
            data: {
                name: data.name,
                description: data.description,
                visibility: data.visibility,
                costCenter: data.costCenter,
                ownerId: data.ownerId,
                members: {
                    create: {
                        userId: data.ownerId,
                        role: client_1.CloudRole.OWNER,
                        status: client_1.MembershipStatus.ACTIVE
                    }
                }
            }
        });
        return cloud;
    }
    async getCloudsForUser(userId) {
        return this.prisma.talentCloud.findMany({
            where: {
                members: {
                    some: {
                        userId: userId,
                        status: client_1.MembershipStatus.ACTIVE
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
    async getCloudDetails(cloudId, userId) {
        const cloud = await this.prisma.talentCloud.findUnique({
            where: { id: cloudId },
            include: {
                members: {
                    include: {}
                },
                budgets: true,
                policies: true
            }
        });
        if (!cloud)
            throw new common_1.NotFoundException('Cloud not found');
        const isMember = cloud.members.some(m => m.userId === userId && m.status === client_1.MembershipStatus.ACTIVE);
        if (cloud.visibility === client_1.Visibility.PRIVATE && !isMember) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return cloud;
    }
    async inviteMember(cloudId, email, inviterId) {
        const membership = await this.prisma.talentCloudMember.findUnique({
            where: { cloudId_userId: { cloudId, userId: inviterId } }
        });
        if (!membership || (membership.role !== client_1.CloudRole.OWNER && membership.role !== client_1.CloudRole.ADMIN)) {
            throw new common_1.ForbiddenException('Only Admins can invite members');
        }
        return this.prisma.talentCloudInvitation.create({
            data: {
                cloudId,
                inviterId,
                inviteeId: 'PENDING_RESOLUTION',
                email,
                status: client_1.InvitationStatus.PENDING
            }
        });
    }
    async getInvitationsForUser(userId, email) {
        return this.prisma.talentCloudInvitation.findMany({
            where: {
                status: client_1.InvitationStatus.PENDING,
                OR: [
                    { inviteeId: userId },
                    { email: email || '' }
                ]
            },
            include: {
                cloud: {
                    select: { name: true, ownerId: true }
                }
            }
        });
    }
    async acceptInvitation(invitationId, userId) {
        const invitation = await this.prisma.talentCloudInvitation.findUnique({
            where: { id: invitationId }
        });
        if (!invitation || invitation.status !== client_1.InvitationStatus.PENDING) {
            throw new common_1.BadRequestException('Invalid invitation');
        }
        await this.prisma.talentCloudMember.create({
            data: {
                cloudId: invitation.cloudId,
                userId: userId,
                role: client_1.CloudRole.MEMBER,
                status: client_1.MembershipStatus.ACTIVE
            }
        });
        await this.prisma.talentCloudInvitation.update({
            where: { id: invitationId },
            data: {
                status: client_1.InvitationStatus.ACCEPTED,
                inviteeId: userId
            }
        });
        return { success: true };
    }
};
exports.CloudService = CloudService;
exports.CloudService = CloudService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CloudService);
//# sourceMappingURL=cloud.service.js.map