import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ComplianceService {
    private readonly logger = new Logger(ComplianceService.name);

    // Simple regex-based validation for common Tax IDs
    private readonly validationRules: Record<string, RegExp> = {
        'SSN': /^\d{3}-?\d{2}-?\d{4}$/, // US SSN
        'EIN': /^\d{2}-?\d{7}$/,       // US EIN
        'VAT': /^[A-Z]{2}[0-9A-Z]{2,12}$/, // Generic VAT (Simplified)
        'DEFAULT': /^[0-9A-Z-]{5,20}$/
    };

    validateTaxId(type: string, id: string): boolean {
        const rule = this.validationRules[type] || this.validationRules['DEFAULT'];
        const isValid = rule.test(id);

        if (!isValid) {
            this.logger.warn(`Invalid Tax ID format for type ${type}: ${id.slice(0, 3)}...`);
        }

        return isValid;
    }

    getMaskedId(id: string): string {
        if (!id) return '';
        const last4 = id.slice(-4);
        return last4.padStart(id.length, '*');
    }

    async performAutomatedCheck(userId: string, taxId: string, type: string) {
        // In a real scenario, this might call an external API like Middesk, Stripe Identity, or a government database.
        // For this MVP, we perform format validation and then "queue" it for manual review if it passes format check.

        const isValidFormat = this.validateTaxId(type, taxId);

        return {
            success: isValidFormat,
            recommendation: isValidFormat ? 'MANUAL_REVIEW' : 'REJECT_AUTO',
            reason: isValidFormat ? 'Format valid, awaiting background check' : 'Invalid Tax ID format'
        };
    }
}
