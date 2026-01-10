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
        const cloud = await this.prisma.talentCloud.create({ data });
        await this.prisma.talentCloudMember.create({
            data: { cloudId: cloud.id, userId: data.ownerId, role: 'OWNER' },
        });
        await this.notifyUserService(data.ownerId, { hasCloudOwnership: true });
        return cloud;
    }
    async addMember(cloudId, userId, role = 'MEMBER') {
        const member = await this.prisma.talentCloudMember.create({
            data: { cloudId, userId, role },
        });
        await this.notifyUserService(userId, { isCloudMember: true, cloudId });
        return member;
    }
    async removeMember(cloudId, userId) {
        await this.prisma.talentCloudMember.deleteMany({ where: { cloudId, userId } });
        await this.notifyUserService(userId, { isCloudMember: false, cloudId });
        return { success: true };
    }
    async listCloudsForUser(userId) {
        return this.prisma.talentCloudMember.findMany({ where: { userId }, include: { cloud: true } });
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