import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TaxCalculationService {
    private readonly logger = new Logger(TaxCalculationService.name);
    private cache: Map<string, { setting: any, timestamp: number }> = new Map();
    private readonly CACHE_TTL = 1000 * 60 * 10; // 10 minutes

    constructor(private prisma: PrismaService) { }

    private async getTaxSetting(countryCode: string) {
        const cached = this.cache.get(countryCode);
        if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
            return cached.setting;
        }

        const taxSetting = await this.prisma.taxSetting.findUnique({
            where: { countryCode },
        });

        this.cache.set(countryCode, { setting: taxSetting, timestamp: Date.now() });
        return taxSetting;
    }

    async calculateTax(amount: Decimal | number, countryCode: string, isVerified: boolean = true): Promise<{ taxAmount: Decimal; taxRate: number }> {
        const taxSetting = await this.getTaxSetting(countryCode);

        // Backup Withholding logic for unverified US users (Standard IRS 24% rate)
        if (!isVerified && countryCode === 'US') {
            this.logger.warn(`User is UNVERIFIED in the US. Applying 24% backup withholding.`);
            const amt = new Decimal(amount);
            const rate = 24.0;
            return {
                taxAmount: amt.mul(rate).div(100),
                taxRate: rate,
            };
        }

        if (!taxSetting || !taxSetting.isActive) {
            this.logger.warn(`No active tax setting found for country: ${countryCode}. Defaulting to 0%.`);
            return {
                taxAmount: new Decimal(0),
                taxRate: 0,
            };
        }

        const amt = new Decimal(amount);
        let rate = Number(taxSetting.taxRate);

        // Bracket-based logic
        if (taxSetting.brackets && Array.isArray(taxSetting.brackets)) {
            const brackets = taxSetting.brackets as any[];
            const applicableBracket = brackets.find(b => {
                const min = b.min ? new Decimal(b.min) : new Decimal(0);
                const max = b.max ? new Decimal(b.max) : new Decimal(Infinity);
                return amt.gte(min) && amt.lte(max);
            });

            if (applicableBracket) {
                rate = applicableBracket.rate;
            }
        }

        const taxAmount = amt.mul(rate).div(100);

        return {
            taxAmount,
            taxRate: rate,
        };
    }
}
