import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
export declare class TaxCalculationService {
    private prisma;
    private readonly logger;
    private cache;
    private readonly CACHE_TTL;
    constructor(prisma: PrismaService);
    private getTaxSetting;
    calculateTax(amount: Decimal | number, countryCode: string, isVerified?: boolean): Promise<{
        taxAmount: Decimal;
        taxRate: number;
    }>;
}
