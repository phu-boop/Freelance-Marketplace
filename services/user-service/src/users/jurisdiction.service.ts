import { Injectable, Logger } from '@nestjs/common';

export interface LegalRequirement {
    jurisdiction: string;
    requiredClauses: string[];
    isGdprSubject: boolean;
    taxIdType?: string; // SSN, EIN, VAT, etc.
    withholdingRate?: number; // Percentage (e.g., 0.30 for 30%)
    isSanctioned?: boolean;
}

@Injectable()
export class JurisdictionService {
    private readonly logger = new Logger(JurisdictionService.name);

    private readonly countryMap: Record<string, LegalRequirement> = {
        US: {
            jurisdiction: 'United States',
            requiredClauses: ['Section 199A Compliance', 'Prop 65 Warning (if CA)'],
            isGdprSubject: false,
            taxIdType: 'SSN/EIN',
            withholdingRate: 0.0, // Domestic
        },
        GB: {
            jurisdiction: 'United Kingdom',
            requiredClauses: ['IR35 Determination', 'HMRC Reporting Clause'],
            isGdprSubject: true,
            taxIdType: 'NINO',
            withholdingRate: 0.0,
        },
        VN: {
            jurisdiction: 'Vietnam',
            requiredClauses: ['VAT Invoice Requirement', 'Social Insurance Contribution'],
            isGdprSubject: false,
            taxIdType: 'MST',
            withholdingRate: 0.10, // Foreign contractor tax approx
        },
        BR: {
            jurisdiction: 'Brazil',
            requiredClauses: ['ISS/PIS/COFINS Tax Withholding', 'LGPD Data Protection'],
            isGdprSubject: false,
            taxIdType: 'CPF/CNPJ',
            withholdingRate: 0.15,
        },
        // Sanctioned Examples
        KP: { jurisdiction: 'North Korea', requiredClauses: [], isGdprSubject: false, isSanctioned: true },
        IR: { jurisdiction: 'Iran', requiredClauses: [], isGdprSubject: false, isSanctioned: true },

        DEFAULT: {
            jurisdiction: 'International/General',
            requiredClauses: ['General Service Terms', 'Standard Arbitration Clause'],
            isGdprSubject: false,
            withholdingRate: 0.30, // Default US backup withholding for non-treaty
        },
    };

    /**
     * Get legal requirements based on country code
     */
    getRequirement(countryCode: string): LegalRequirement {
        const code = countryCode?.toUpperCase();
        if (this.countryMap[code]) {
            return this.countryMap[code];
        }

        // Check if EU for GDPR
        if (this.isEuCountry(code)) {
            return {
                ...this.countryMap.DEFAULT,
                jurisdiction: `EU (${code})`,
                isGdprSubject: true,
            };
        }

        return this.countryMap.DEFAULT;
    }

    /**
     * Simple check for EU countries
     */
    private isEuCountry(countryCode: string): boolean {
        const euCodes = [
            'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI',
            'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT',
            'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'
        ];
        return euCodes.includes(countryCode);
    }
}
