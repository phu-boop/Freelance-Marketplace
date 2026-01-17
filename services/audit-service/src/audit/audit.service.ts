import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);

    constructor(private prisma: PrismaService) { }

    async create(dto: CreateAuditLogDto) {
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

    private generateChecksum(dto: CreateAuditLogDto): string {
        const data = JSON.stringify({
            service: dto.service,
            eventType: dto.eventType,
            actorId: dto.actorId,
            amount: dto.amount,
            metadata: dto.metadata,
            referenceId: dto.referenceId,
            secret: process.env.AUDIT_SECRET || 'fallback-secret',
        });
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    async verifyLog(id: string): Promise<boolean> {
        const log = await this.prisma.auditLog.findUnique({ where: { id } });
        if (!log) return false;

        const isValid = this.isChecksumValid(log);
        if (!isValid) {
            this.logger.error(`AUDIT CORRUPTION ALERT: Log entry ${id} checksum mismatch!`);
        }
        return isValid;
    }

    async verifyAll(): Promise<{ total: number, corrupt: string[] }> {
        const logs = await this.prisma.auditLog.findMany();
        const corrupt: string[] = [];

        for (const log of logs) {
            if (!this.isChecksumValid(log)) {
                corrupt.push(log.id);
                this.logger.error(`INTEGRITY FAILURE: Audit log ${log.id} has been tampered with!`);
            }
        }

        if (corrupt.length > 0) {
            // Trigger alerts (e.g., Slack, email, or a dedicated Alert table)
            this.logger.error(`SECURITY ALERT: ${corrupt.length} compromised audit logs detected!`);
        }

        return { total: logs.length, corrupt };
    }

    private isChecksumValid(log: any): boolean {
        const dto: CreateAuditLogDto = {
            service: log.service,
            eventType: log.eventType,
            actorId: log.actorId,
            amount: log.amount ? Number(log.amount) : undefined,
            metadata: log.metadata,
            referenceId: log.referenceId,
        };

        return log.checksum === this.generateChecksum(dto);
    }
}
