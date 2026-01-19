import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
export declare class TaxCalculationService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    calculateTax(amount: Decimal | number, countryCode: string): Promise<{
        taxAmount: Decimal;
        taxRate: number;
    }>;
}
