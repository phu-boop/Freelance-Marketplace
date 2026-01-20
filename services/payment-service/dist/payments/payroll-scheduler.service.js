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
var PayrollSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const payments_service_1 = require("./payments.service");
const prisma_service_1 = require("../prisma/prisma.service");
let PayrollSchedulerService = PayrollSchedulerService_1 = class PayrollSchedulerService {
    paymentsService;
    prisma;
    logger = new common_1.Logger(PayrollSchedulerService_1.name);
    constructor(paymentsService, prisma) {
        this.paymentsService = paymentsService;
        this.prisma = prisma;
    }
    async handlePayrollCycles() {
        this.logger.log('Starting nightly payroll cycle check...');
        try {
            const now = new Date();
            this.logger.log('Payroll cycle check completed.');
        }
        catch (error) {
            this.logger.error(`Error in payroll scheduler: ${error.message}`);
        }
    }
};
exports.PayrollSchedulerService = PayrollSchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayrollSchedulerService.prototype, "handlePayrollCycles", null);
exports.PayrollSchedulerService = PayrollSchedulerService = PayrollSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService,
        prisma_service_1.PrismaService])
], PayrollSchedulerService);
//# sourceMappingURL=payroll-scheduler.service.js.map