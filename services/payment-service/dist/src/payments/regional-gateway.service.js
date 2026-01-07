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
var RegionalGatewayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegionalGatewayService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RegionalGatewayService = RegionalGatewayService_1 = class RegionalGatewayService {
    prisma;
    logger = new common_1.Logger(RegionalGatewayService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async processRegionalPayout(userId, amount, methodId) {
        const method = await this.prisma.withdrawalMethod.findUnique({
            where: { id: methodId },
        });
        if (!method || method.userId !== userId) {
            throw new common_1.BadRequestException('Invalid withdrawal method');
        }
        this.logger.log(`Processing ${method.type} payout for user ${userId} via ${method.provider || 'default'}`);
        switch (method.type) {
            case 'MOMO':
                return this.processMomo(amount, method.accountNumber);
            case 'PIX':
                return this.processPix(amount, method.accountNumber);
            case 'PROMPTPAY':
                return this.processPromptPay(amount, method.accountNumber);
            case 'M_PESA':
                return this.processMPesa(amount, method.accountNumber);
            default:
                throw new common_1.BadRequestException(`Regional gateway for ${method.type} not implemented`);
        }
    }
    async processMomo(amount, phone) {
        this.logger.log(`[Momo] Sending ${amount} to ${phone}`);
        return { success: true, txnId: `MOMO_${Date.now()}` };
    }
    async processPix(amount, key) {
        this.logger.log(`[Pix] Sending ${amount} to key ${key}`);
        return { success: true, txnId: `PIX_${Date.now()}` };
    }
    async processPromptPay(amount, id) {
        this.logger.log(`[PromptPay] Sending ${amount} to ${id}`);
        return { success: true, txnId: `PP_${Date.now()}` };
    }
    async processMPesa(amount, phone) {
        this.logger.log(`[M-Pesa] Sending ${amount} to ${phone}`);
        return { success: true, txnId: `MPESA_${Date.now()}` };
    }
};
exports.RegionalGatewayService = RegionalGatewayService;
exports.RegionalGatewayService = RegionalGatewayService = RegionalGatewayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RegionalGatewayService);
//# sourceMappingURL=regional-gateway.service.js.map