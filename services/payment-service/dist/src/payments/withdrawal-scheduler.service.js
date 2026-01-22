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
var WithdrawalSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const payments_service_1 = require("./payments.service");
const prisma_service_1 = require("../prisma/prisma.service");
let WithdrawalSchedulerService = WithdrawalSchedulerService_1 = class WithdrawalSchedulerService {
    prisma;
    paymentsService;
    logger = new common_1.Logger(WithdrawalSchedulerService_1.name);
    constructor(prisma, paymentsService) {
        this.prisma = prisma;
        this.paymentsService = paymentsService;
    }
    async handleAutoWithdrawals() {
        this.logger.log('Starting automatic withdrawal processing...');
        const wallets = await this.prisma.wallet.findMany({
            where: { autoWithdrawalEnabled: true },
        });
        const now = new Date();
        const isMonday = now.getUTCDay() === 1;
        const isFirstOfMonth = now.getUTCDate() === 1;
        for (const wallet of wallets) {
            try {
                if (wallet.autoWithdrawalSchedule === 'WEEKLY' && !isMonday)
                    continue;
                if (wallet.autoWithdrawalSchedule === 'MONTHLY' && !isFirstOfMonth)
                    continue;
                const balance = Number(wallet.balance);
                const threshold = wallet.autoWithdrawalThreshold
                    ? Number(wallet.autoWithdrawalThreshold)
                    : 0;
                if (balance <= 0 || balance < threshold)
                    continue;
                this.logger.log(`Triggering auto-withdrawal for user ${wallet.userId} - Amount: $${balance}`);
                await this.paymentsService.withdraw(wallet.userId, balance);
                this.logger.log(`Successfully processed auto-withdrawal for user ${wallet.userId}`);
            }
            catch (error) {
                this.logger.error(`Failed to process auto-withdrawal for user ${wallet.userId}: ${error.message}`);
            }
        }
        this.logger.log('Finished automatic withdrawal processing.');
    }
};
exports.WithdrawalSchedulerService = WithdrawalSchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WithdrawalSchedulerService.prototype, "handleAutoWithdrawals", null);
exports.WithdrawalSchedulerService = WithdrawalSchedulerService = WithdrawalSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        payments_service_1.PaymentsService])
], WithdrawalSchedulerService);
//# sourceMappingURL=withdrawal-scheduler.service.js.map