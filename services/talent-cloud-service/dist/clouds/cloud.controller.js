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
exports.CloudController = void 0;
const common_1 = require("@nestjs/common");
const cloud_service_1 = require("./cloud.service");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
let CloudController = class CloudController {
    constructor(cloudService) {
        this.cloudService = cloudService;
    }
    async createCloud(req, data) {
        return this.cloudService.createCloud({
            ...data,
            ownerId: req.user.sub
        });
    }
    async getMyClouds(req) {
        return this.cloudService.getCloudsForUser(req.user.sub);
    }
    async getCloudDetails(id, req) {
        return this.cloudService.getCloudDetails(id, req.user.sub);
    }
    async inviteMember(id, body, req) {
        return this.cloudService.inviteMember(id, body.email, req.user.sub);
    }
    async getMyInvitations(req) {
        return this.cloudService.getInvitationsForUser(req.user.sub, req.user.email);
    }
    async acceptInvitation(invitationId, req) {
        return this.cloudService.acceptInvitation(invitationId, req.user.sub);
    }
};
exports.CloudController = CloudController;
__decorate([
    (0, common_1.Post)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:CLIENT', 'CLIENT'] }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "createCloud", null);
__decorate([
    (0, common_1.Get)(),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "getMyClouds", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'] }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "getCloudDetails", null);
__decorate([
    (0, common_1.Post)(':id/invite'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:CLIENT', 'CLIENT'] }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "inviteMember", null);
__decorate([
    (0, common_1.Get)('invitations/my'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'FREELANCER'] }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "getMyInvitations", null);
__decorate([
    (0, common_1.Post)('invitations/:id/accept'),
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:FREELANCER', 'FREELANCER'] }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CloudController.prototype, "acceptInvitation", null);
exports.CloudController = CloudController = __decorate([
    (0, common_1.Controller)('api/clouds'),
    (0, common_1.UseGuards)(nest_keycloak_connect_1.AuthGuard, nest_keycloak_connect_1.RoleGuard),
    __metadata("design:paramtypes", [cloud_service_1.CloudService])
], CloudController);
//# sourceMappingURL=cloud.controller.js.map