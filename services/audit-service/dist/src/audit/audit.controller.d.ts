import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    create(createAuditLogDto: CreateAuditLogDto, secret?: string): Promise<{
        service: string;
        eventType: string;
        actorId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        referenceId: string | null;
        durationMs: number | null;
        traceId: string | null;
        status: string | null;
        id: string;
        timestamp: Date;
        checksum: string;
    }>;
    findAll(limit?: number, offset?: number): Promise<{
        service: string;
        eventType: string;
        actorId: string | null;
        amount: import("@prisma/client/runtime/library").Decimal | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        referenceId: string | null;
        durationMs: number | null;
        traceId: string | null;
        status: string | null;
        id: string;
        timestamp: Date;
        checksum: string;
    }[]>;
    verify(id: string): Promise<boolean>;
    verifyAll(): Promise<{
        total: number;
        corrupt: string[];
    }>;
}
