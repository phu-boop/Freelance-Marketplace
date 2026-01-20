import { PrismaService } from '../prisma/prisma.service';
export declare class PiiScannerCron {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    scanForPii(): Promise<void>;
}
