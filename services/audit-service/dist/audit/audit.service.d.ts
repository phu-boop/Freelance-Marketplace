import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
export declare class AuditService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(dto: CreateAuditLogDto): Promise<any>;
    findAll(limit?: number, offset?: number): Promise<any>;
    private generateChecksum;
    verifyLog(id: string): Promise<boolean>;
}
