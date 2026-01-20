import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PiiScannerCron {
    private readonly logger = new Logger(PiiScannerCron.name);

    constructor(private prisma: PrismaService) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async scanForPii() {
        this.logger.log('Starting nightly PII scan...');

        // Mock scanning user bios for patterns
        const suspiciousUsers = await this.prisma.auditLog.findMany({
            take: 10, // Scan a batch
            where: {
                action: 'UPDATE_PROFILE', // Focus on profile updates
            },
            orderBy: { createdAt: 'desc' },
        });

        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        const ssnRegex = /\d{3}-\d{2}-\d{4}/;

        let issuesFound = 0;

        for (const log of suspiciousUsers) {
            const details = JSON.stringify(log.details);
            if (emailRegex.test(details) || ssnRegex.test(details)) {
                this.logger.warn(`[PII ALERT] Potential unencrypted PII found in AuditLog ID: ${log.id}`);
                issuesFound++;
            }
        }

        this.logger.log(`PII Scan Completed. Issues found: ${issuesFound}`);
    }
}
