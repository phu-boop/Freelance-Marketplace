import { Injectable } from '@nestjs/common';

@Injectable()
export class JurisdictionService {
    private readonly mandatoryClauses: Record<string, any[]> = {
        'EU': [
            {
                title: 'Data Privacy (GDPR Compliance)',
                content: 'Both parties agree to comply with GDPR requirements regarding the processing of personal data.'
            }
        ],
        'UK': [
            {
                title: 'IR35 Compliance',
                content: 'Freelancer acknowledges their status as an independent contractor and agrees to the IR35 determination provided by the client.'
            }
        ],
        'US': [
            {
                title: 'Tax Compliance (W-9/W-8BEN)',
                content: 'Freelancer agrees to provide necessary tax documentation (W-9 for US persons, W-8BEN for non-US) for IRS reporting. Work is performed under Section 199A where applicable.'
            }
        ],
        'AU': [
            {
                title: 'TFN/ABN Verification',
                content: 'Freelancer confirms they hold a valid Australian Business Number (ABN) or have provided a Tax File Number (TFN) declaration.'
            }
        ],
        'CA': [
            {
                title: 'HST/GST Registration',
                content: 'Freelancer confirms compliance with Canadian sales tax registration if applicable.'
            }
        ],
        'VN': [
            {
                title: 'Social Insurance Compliance',
                content: 'Parties acknowledge local labor regulations for long-term engagements.'
            }
        ]
    };

    getRequiredClauses(countryCode: string): any[] {
        const clauses: any[] = [];

        // 1. Specific Country Clauses
        if (this.mandatoryClauses[countryCode]) {
            clauses.push(...this.mandatoryClauses[countryCode]);
        }

        // 2. EU Region (GDPR)
        const euCountries = [
            'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
        ];
        if (euCountries.includes(countryCode) && !clauses.some(c => c.title.includes('GDPR'))) {
            clauses.push(...(this.mandatoryClauses['EU'] || []));
        }

        return clauses;
    }
}
