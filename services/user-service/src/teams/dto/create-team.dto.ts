export class CreateTeamDto {
  name: string;
  description?: string;
  logoUrl?: string;
  isAgency?: boolean;
  agencyWebsite?: string;
  legalName?: string;
  taxId?: string;
  revenueSplitPercent?: number;
}
