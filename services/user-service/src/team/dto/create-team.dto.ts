import { IsString, IsOptional, IsBoolean, IsNumber, IsArray } from 'class-validator';

export class CreateTeamDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    logoUrl?: string;

    @IsString()
    ownerId: string;

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
