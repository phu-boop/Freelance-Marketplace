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

        const dto: CreateAuditLogDto = {
            service: log.service,
            eventType: log.eventType,
            actorId: log.actorId,
            amount: Number(log.amount),
            metadata: log.metadata,
            referenceId: log.referenceId,
        };

        return log.checksum === this.generateChecksum(dto);
    }
}
