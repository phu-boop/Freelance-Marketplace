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
var AuditService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto = require("crypto");
let AuditService = AuditService_1 = class AuditService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AuditService_1.name);
    }
    async onModuleInit() {
        this.logger.log('AuditService initialized. Running initial retention check...');
        await this.runRetentionPolicy();
    }
    async runRetentionPolicy() {
        const retentionPeriodYears = 7;
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - retentionPeriodYears);
        try {
            const deleteResult = await this.prisma.auditLog.deleteMany({
                where: {
                    timestamp: {
                        lt: cutoffDate,
                    },
                },
            });
            this.logger.log(`Retention policy applied: Removed ${deleteResult.count} logs older than ${retentionPeriodYears} years.`);
        }
        catch (error) {
            this.logger.error(`Failed to apply retention policy: ${error.message}`);
        }
    }
    async create(dto) {
        const checksum = this.generateChecksum(dto);
        this.logger.log(`Logging financial event: ${dto.eventType} from ${dto.service}`);
        return this.prisma.auditLog.create({
            data: {
                ...dto,
                checksum,
            },
        });
    }
    async findAll(limit = 100, offset = 0) {
        return this.prisma.auditLog.findMany({
            take: Number(limit),
            skip: Number(offset),
            orderBy: { timestamp: 'desc' },
        });
    }
    generateChecksum(dto) {
        const data = JSON.stringify({
            service: dto.service,
            eventType: dto.eventType,
            actorId: dto.actorId,
            amount: dto.amount,
            metadata: dto.metadata,
            referenceId: dto.referenceId,
            durationMs: dto.durationMs,
            traceId: dto.traceId,
            status: dto.status,
            secret: process.env.AUDIT_SECRET || 'fallback-secret',
        });
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    async verifyLog(id) {
        const log = await this.prisma.auditLog.findUnique({ where: { id } });
        if (!log)
            return false;
        const isValid = this.isChecksumValid(log);
        if (!isValid) {
            this.logger.error(`AUDIT CORRUPTION ALERT: Log entry ${id} checksum mismatch!`);
        }
        return isValid;
    }
    async verifyAll() {
        const logs = await this.prisma.auditLog.findMany();
        const corrupt = [];
        for (const log of logs) {
            if (!this.isChecksumValid(log)) {
                corrupt.push(log.id);
                this.logger.error(`INTEGRITY FAILURE: Audit log ${log.id} has been tampered with!`);
            }
        }
        if (corrupt.length > 0) {
            this.logger.error(`SECURITY ALERT: ${corrupt.length} compromised audit logs detected!`);
        }
        return { total: logs.length, corrupt };
    }
    isChecksumValid(log) {
        const dto = {
            service: log.service,
            eventType: log.eventType,
            actorId: log.actorId,
            amount: log.amount ? Number(log.amount) : undefined,
            metadata: log.metadata,
            referenceId: log.referenceId,
            durationMs: log.durationMs,
            traceId: log.traceId,
            status: log.status,
        };
        return log.checksum === this.generateChecksum(dto);
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = AuditService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuditService);
//# sourceMappingURL=audit.service.js.map