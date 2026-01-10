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
var SubscriptionSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const payments_service_1 = require("./payments.service");
const prisma_service_1 = require("../prisma/prisma.service");
let SubscriptionSchedulerService = SubscriptionSchedulerService_1 = class SubscriptionSchedulerService {
    prisma;
    paymentsService;
    logger = new common_1.Logger(SubscriptionSchedulerService_1.name);
    constructor(prisma, paymentsService) {
        this.prisma = prisma;
        this.paymentsService = paymentsService;
    }
    async handleSubscriptionRenewals() {
        this.logger.log('Starting subscription renewal processing...');
        const today = new Date();
        const expiringSubscriptions = await this.prisma.subscription.findMany({
            where: {
                status: 'ACTIVE',
                nextBillingDate: { lte: today },
            },
        });
        this.logger.log(`Found ${expiringSubscriptions.length} subscriptions candidate for renewal`);
        for (const sub of expiringSubscriptions) {
            try {
                this.logger.log(`Renewing subscription ${sub.id} for user ${sub.userId}`);
                await this.paymentsService.createSubscription(sub.userId, {
                    planId: sub.planId,
                    price: Number(sub.price)
                });
                await this.prisma.subscription.update({
                    where: { id: sub.id },
                    data: { status: 'EXPIRED' }
                });
                this.logger.log(`Successfully renewed subscription for user ${sub.userId}`);
            }
            catch (error) {
                this.logger.error(`Failed to renew subscription for user ${sub.userId}: ${error.message}`);
                await this.prisma.subscription.update({
                    where: { id: sub.id },
                    data: { status: 'PAST_DUE' }
                });
            }
        }
        this.logger.log('Finished subscription renewal processing.');
    }
};
exports.SubscriptionSchedulerService = SubscriptionSchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionSchedulerService.prototype, "handleSubscriptionRenewals", null);
exports.SubscriptionSchedulerService = SubscriptionSchedulerService = SubscriptionSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        payments_service_1.PaymentsService])
], SubscriptionSchedulerService);
//# sourceMappingURL=subscription-scheduler.service.js.map