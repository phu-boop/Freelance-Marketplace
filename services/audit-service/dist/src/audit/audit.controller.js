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
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("./audit.service");
const create_audit_log_dto_1 = require("./dto/create-audit-log.dto");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
let AuditController = class AuditController {
    constructor(auditService) {
        this.auditService = auditService;
    }
    create(createAuditLogDto, secret) {
        const internalSecret = process.env.AUDIT_SECRET || 'fallback-secret';
        if (secret !== internalSecret) {
            throw new common_1.ForbiddenException('Invalid audit secret');
        }
        return this.auditService.create(createAuditLogDto);
    }
    findAll(limit, offset) {
        return this.auditService.findAll(limit, offset);
    }
    verify(id) {
        return this.auditService.verifyLog(id);
    }
    verifyAll() {
        return this.auditService.verifyAll();
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, nest_keycloak_connect_1.Public)(),
    (0, common_1.Post)('logs'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-audit-secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_audit_log_dto_1.CreateAuditLogDto, String]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "create", null);
__decorate([
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:ADMIN'] }),
    (0, common_1.Get)('logs'),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "findAll", null);
__decorate([
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:ADMIN'] }),
    (0, common_1.Get)('logs/:id/verify'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "verify", null);
__decorate([
    (0, nest_keycloak_connect_1.Roles)({ roles: ['realm:ADMIN'] }),
    (0, common_1.Post)('verify-all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "verifyAll", null);
exports.AuditController = AuditController = __decorate([
    (0, common_1.Controller)('api/audit'),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map