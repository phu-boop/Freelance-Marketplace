import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class UpdateTeamDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    logoUrl?: string;

    @IsOptional()
    @IsBoolean()
    isAgency?: boolean;

    @IsOptional()
    @IsString()
    agencyWebsite?: string;

    @IsOptional()
    @IsString()
    legalName?: string;

    @IsOptional()
    @IsString()
    taxId?: string;

    @IsOptional()
    @IsNumber()
    revenueSplitPercent?: number;
}
