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
var AbacGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbacGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
let AbacGuard = AbacGuard_1 = class AbacGuard {
    reflector;
    logger = new common_1.Logger(AbacGuard_1.name);
    constructor(reflector) {
        this.reflector = reflector;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const handler = context.getHandler();
        const policy = this.reflector.get('abac_policy', handler);
        if (!policy) {
            return true;
        }
        if (!user) {
            this.logger.warn('ABAC Check Failed: No user in request');
            return false;
        }
        this.logger.log(`Evaluating ABAC Policy: ${policy} for User: ${user.sub}`);
        if (policy === 'OWN_RESOURCE_OR_ADMIN') {
            const resourceId = request.params.id || request.body.id;
            const isAdmin = user.realm_access?.roles?.includes('ADMIN');
            const isOwner = resourceId && resourceId.startsWith(user.sub);
            if (isAdmin || isOwner) {
                return true;
            }
            this.logger.warn(`ABAC Deny: User ${user.sub} is not owner of ${resourceId} and not ADMIN`);
            return false;
        }
        if (policy === 'WORKING_HOURS_ONLY') {
            const hour = new Date().getHours();
            if (hour >= 9 && hour <= 17) {
                return true;
            }
            this.logger.warn(`ABAC Deny: Access allowed only between 9-17. Current: ${hour}`);
            return false;
        }
        return true;
    }
};
exports.AbacGuard = AbacGuard;
exports.AbacGuard = AbacGuard = AbacGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], AbacGuard);
//# sourceMappingURL=abac.guard.js.map