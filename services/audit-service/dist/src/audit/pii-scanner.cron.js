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
var PiiScannerCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PiiScannerCron = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
let PiiScannerCron = PiiScannerCron_1 = class PiiScannerCron {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(PiiScannerCron_1.name);
    }
    async scanForPii() {
        this.logger.log('Starting nightly PII scan...');
        const suspiciousUsers = await this.prisma.auditLog.findMany({
            take: 10,
            where: {
                action: 'UPDATE_PROFILE',
            },
            orderBy: { createdAt: 'desc' },
        });
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        const ssnRegex = /\d{3}-\d{2}-\d{4}/;
        let issuesFound = 0;
        for (const log of suspiciousUsers) {
            const details = JSON.stringify(log.details);
            if (emailRegex.test(details) || ssnRegex.test(details)) {
                this.logger.warn(`[PII ALERT] Potential unencrypted PII found in AuditLog ID: ${log.id}`);
                issuesFound++;
            }
        }
        this.logger.log(`PII Scan Completed. Issues found: ${issuesFound}`);
    }
};
exports.PiiScannerCron = PiiScannerCron;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PiiScannerCron.prototype, "scanForPii", null);
exports.PiiScannerCron = PiiScannerCron = PiiScannerCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PiiScannerCron);
//# sourceMappingURL=pii-scanner.cron.js.map