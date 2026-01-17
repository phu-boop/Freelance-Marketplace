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
exports.CloudsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let CloudsService = class CloudsService {
    constructor(prisma, http) {
        this.prisma = prisma;
        this.http = http;
    }
    async createCloud(data) {
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
        await this.prisma.talentCloudMember.create({
            data: { cloudId: cloud.id, userId: data.ownerId, role: 'OWNER' },
        });
        await this.notifyUserService(data.ownerId, { hasCloudOwnership: true });
        return cloud;
    }
    async addMember(cloudId, userId, role = 'MEMBER') {
        const member = await this.prisma.talentCloudMember.upsert({
            where: { cloudId_userId: { cloudId, userId } },
            update: { role },
            create: { cloudId, userId, role },
        });
        await this.notifyUserService(userId, { isCloudMember: true, cloudId }).catch(() => { });
        return member;
    }
    async addMembersBulk(cloudId, userIds, role = 'MEMBER') {
        const operations = userIds.map(userId => this.prisma.talentCloudMember.upsert({
            where: { cloudId_userId: { cloudId, userId } },
            update: { role },
            create: { cloudId, userId, role }
        }));
        const results = await Promise.all(operations);
        await Promise.all(userIds.map(userId => this.notifyUserService(userId, { isCloudMember: true, cloudId }).catch(() => { })));
        return { count: results.length };
    }
    async removeMember(cloudId, userId) {
        await this.prisma.talentCloudMember.deleteMany({ where: { cloudId, userId } });
        await this.notifyUserService(userId, { isCloudMember: false, cloudId });
        return { success: true };
    }
    async listCloudsForUser(userId) {
        return this.prisma.talentCloudMember.findMany({ where: { userId }, include: { cloud: true } });
    }
    async getCloud(cloudId) {
        const cloud = await this.prisma.talentCloud.findUnique({
            where: { id: cloudId },
            include: { members: true },
        });
        if (!cloud)
            return null;
        const enrichedMembers = await Promise.all(cloud.members.map(async (member) => {
            try {
                const profile = await this.getUserProfile(member.userId);
                return { ...member, userProfile: profile };
            }
            catch (err) {
                return { ...member, userProfile: { id: member.userId, firstName: 'User', lastName: member.userId.slice(0, 4) } };
            }
        }));
        return { ...cloud, members: enrichedMembers };
    }
    async updateCloud(cloudId, data) {
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
    async getUserProfile(userId) {
        const url = `${process.env.USER_SERVICE_INTERNAL_URL || process.env.USER_SERVICE_URL}/api/users/${userId}`;
        const res = await (0, rxjs_1.firstValueFrom)(this.http.get(url));
        return res.data;
    }
    async notifyUserService(userId, payload) {
        const url = `${process.env.USER_SERVICE_URL}/api/users/${userId}/cloud-membership`;
        return (0, rxjs_1.firstValueFrom)(this.http.patch(url, payload));
    }
};
exports.CloudsService = CloudsService;
exports.CloudsService = CloudsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, axios_1.HttpService])
], CloudsService);
//# sourceMappingURL=clouds.service.js.map