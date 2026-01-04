import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    create(createAuditLogDto: CreateAuditLogDto): Promise<any>;
    findAll(limit?: number, offset?: number): Promise<any>;
    verify(id: string): Promise<boolean>;
}
