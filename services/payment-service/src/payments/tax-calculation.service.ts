import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TaxCalculationService {
    private readonly logger = new Logger(TaxCalculationService.name);

    constructor(private prisma: PrismaService) { }

    async calculateTax(amount: Decimal | number, countryCode: string): Promise<{ taxAmount: Decimal; taxRate: number }> {
        const taxSetting = await this.prisma.taxSetting.findUnique({
            where: { countryCode },
        });

        if (!taxSetting || !taxSetting.isActive) {
            this.logger.warn(`No active tax setting found for country: ${countryCode}. Defaulting to 0%.`);
            return {
                taxAmount: new Decimal(0),
                taxRate: 0,
            };
        }

        const rate = Number(taxSetting.taxRate);
        const taxAmount = new Decimal(amount).mul(rate).div(100);

        return {
            taxAmount,
            taxRate: rate,
        };
    }
}
