import { Injectable, Logger } from '@nestjs/common';

export interface LegalClause {
    id: string;
    title: string;
    content: string;
    mandatory: boolean;
}

@Injectable()
export class JurisdictionService {
    private readonly logger = new Logger(JurisdictionService.name);

    private readonly clauses: Record<string, LegalClause[]> = {
        'US': [
            {
                id: 'US-199A',
                title: 'Section 199A Disclaimer',
                content: 'This contract does not constitute an employment relationship. The Freelancer is an independent contractor as defined by the IRS.',
                mandatory: true
            },
            {
                id: 'US-IP',
                title: 'US Intellectual Property Assignment',
                content: 'All work product created under this contract ("Work Made for Hire") shall be the sole property of the Client.',
                mandatory: true
            }
        ],
        'EU': [
            {
                id: 'EU-GDPR',
                title: 'GDPR Data Processing Addendum',
                content: 'Both parties agree to comply with the General Data Protection Regulation (EU) 2016/679. The Freelancer shall only process personal data on documented instructions from the Client.',
                mandatory: true
            },
            {
                id: 'EU-VAT',
                title: 'Reverse Charge VAT',
                content: 'The recipient of the service relies on the reverse charge mechanism for VAT purposes if applicable.',
                mandatory: true
            }
        ],
        'VN': [
            {
                id: 'VN-LABOR',
                title: 'Vietnamese Labor Code Disclaimer',
                content: 'This agreement is a service contract under the Civil Code of Vietnam and not a labor contract.',
                mandatory: true
            }
        ],
        'GLOBAL': [
            {
                id: 'GEN-CONF',
                title: 'Confidentiality Agreement',
                content: 'The Freelancer agrees to keep all Client information confidential during and after the term of this contract.',
                mandatory: true
            }
        ]
    };

    getRequiredClauses(countryCode: string): any[] {
        return this.getClausesForCountry(countryCode).map(c => ({
            title: c.title,
            content: c.content
        }));
    }

    getClausesForCountry(countryCode: string): LegalClause[] {
        const globalClauses = this.clauses['GLOBAL'] || [];
        const localClauses = this.clauses[countryCode] || [];

        // EU Logic: Map specific EU countries to 'EU' clauses if not specifically defined
        // Simulating simple mapping for now
        const euCountries = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE'];
        if (euCountries.includes(countryCode) && !localClauses.length) {
            return [...globalClauses, ...this.clauses['EU']];
        }

        return [...globalClauses, ...localClauses];
    }

    // Mock method to determine jurisdiction from IP or User Profile
    detectJurisdiction(userProfile: any): string {
        if (userProfile?.location?.countryCode) {
            return userProfile.location.countryCode;
        }
        // Default to Global/US for fallback in MVP
        return 'US';
    }
}
