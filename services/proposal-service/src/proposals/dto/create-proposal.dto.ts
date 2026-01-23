import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateProposalDto {
    @IsString()
    @IsNotEmpty()
    jobId: string;

    @IsString()
    @IsNotEmpty()
    freelancerId: string;

    @IsString()
    @IsNotEmpty()
    coverLetter: string;

    @IsNumber()
    @IsNotEmpty()
    bidAmount: number;

    @IsString()
    @IsOptional()
    timeline?: string;

    @IsOptional()
    screeningAnswers?: any;

    @IsOptional()
    portfolioItemIds?: string[];

    @IsString()
    @IsOptional()
    specializedProfileId?: string;

    @IsString()
    @IsOptional()
    agencyId?: string;

    @IsString()
    @IsOptional()
    status?: string;

    @IsNumber()
    @IsOptional()
    boostAmount?: number;
}
