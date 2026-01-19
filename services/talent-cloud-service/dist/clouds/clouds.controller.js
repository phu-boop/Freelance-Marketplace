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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudsController = void 0;
const common_1 = require("@nestjs/common");
const clouds_service_1 = require("./clouds.service");
let CloudsController = class CloudsController {
    constructor(cloudsService) {
        this.cloudsService = cloudsService;
    }
    async create(dto) {
        return this.cloudsService.createCloud(dto);
    }
    async invite(req, cloudId, dto) {
        const inviterId = req.user?.sub || 'admin';
        return this.cloudsService.inviteMember(cloudId, dto.userId, inviterId);
    }
    async getMyInvitations(req) {
        const userId = req.user?.sub;
        if (!userId)
            throw new Error('Unauthorized');
        return this.cloudsService.getInvitations(userId);
    }
    async respond(req, invitationId, dto) {
        const userId = req.user?.sub;
        if (!userId)
            throw new Error('Unauthorized');
        return this.cloudsService.respondToInvitation(invitationId, userId, dto.accept);
    }
    async addMember(cloudId, dto) {
        return this.cloudsService.addMember(cloudId, dto.userId, dto.role);
    }
    async addMembersBulk(cloudId, dto) {
        return this.cloudsService.addMembersBulk(cloudId, dto.userIds, dto.role);
    }
    async removeMember(cloudId, userId) {
        return this.cloudsService.removeMember(cloudId, userId);
    }
    async listForUser(userId) {
        return this.cloudsService.listCloudsForUser(userId);
    }
    async getOne(id) {
        return this.cloudsService.getCloud(id);
    }
    async update(id, dto) {
        return this.cloudsService.updateCloud(id, dto);
    }
};
exports.CloudsController = CloudsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CloudsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':cloudId/invite'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('cloudId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CloudsController.prototype, "invite", null);
__decorate([
    (0, common_1.Get)('invitations/my'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CloudsController.prototype, "getMyInvitations", null);
__decorate([
    (0, common_1.Post)('invitations/:invitationId/respond'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('invitationId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CloudsController.prototype, "respond", null);
__decorate([
    (0, common_1.Post)(':cloudId/members'),
    __param(0, (0, common_1.Param)('cloudId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CloudsController.prototype, "addMember", null);
__decorate([
    (0, common_1.Post)(':cloudId/members/bulk'),
    __param(0, (0, common_1.Param)('cloudId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CloudsController.prototype, "addMembersBulk", null);
__decorate([
    (0, common_1.Delete)(':cloudId/members/:userId'),
    __param(0, (0, common_1.Param)('cloudId')),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CloudsController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CloudsController.prototype, "listForUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CloudsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CloudsController.prototype, "update", null);
exports.CloudsController = CloudsController = __decorate([
    (0, common_1.Controller)('api/clouds'),
    __metadata("design:paramtypes", [clouds_service_1.CloudsService])
], CloudsController);
//# sourceMappingURL=clouds.controller.js.map