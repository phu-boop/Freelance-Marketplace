import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
export declare class AuditService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(dto: CreateAuditLogDto): Promise<{
        id: string;
        timestamp: Date;
        service: string;
        eventType: string;
        actorId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        checksum: string;
        referenceId: string | null;
    }>;
    findAll(limit?: number, offset?: number): Promise<{
        id: string;
        timestamp: Date;
        service: string;
        eventType: string;
        actorId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        checksum: string;
        referenceId: string | null;
    }[]>;
    private generateChecksum;
    verifyLog(id: string): Promise<boolean>;
    verifyAll(): Promise<{
        total: number;
        corrupt: string[];
    }>;
    private isChecksumValid;
}
