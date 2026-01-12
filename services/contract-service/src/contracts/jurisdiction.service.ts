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
        'US': [
            {
                title: 'Tax Compliance (W-9/W-8BEN)',
                content: 'Freelancer agrees to provide necessary tax documentation upon request for IRS reporting.'
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
        // Simple logic: return clauses for the country or regions (like EU)
        const clauses = this.mandatoryClauses[countryCode] || [];

        // Example: If in EU region (simplified check)
        const euCountries = ['FR', 'DE', 'IT', 'ES', 'PL', 'NL', 'BE'];
        if (euCountries.includes(countryCode) && !clauses.some(c => c.title.includes('GDPR'))) {
            clauses.push(...(this.mandatoryClauses['EU'] || []));
        }

        return clauses;
    }
}
