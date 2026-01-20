import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    create(createAuditLogDto: CreateAuditLogDto, secret?: string): Promise<{
        id: string;
        timestamp: Date;
        service: string;
        eventType: string;
        actorId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        checksum: string;
        referenceId: string | null;
        durationMs: number | null;
        traceId: string | null;
        status: string | null;
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
        durationMs: number | null;
        traceId: string | null;
        status: string | null;
    }[]>;
    verify(id: string): Promise<boolean>;
    verifyAll(): Promise<{
        total: number;
        corrupt: string[];
    }>;
}
