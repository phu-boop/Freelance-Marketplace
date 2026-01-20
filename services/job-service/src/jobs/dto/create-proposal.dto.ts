import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID, IsArray, Min } from 'class-validator';

export class CreateProposalDto {
    @IsUUID()
    @IsNotEmpty()
    jobId: string;

    @IsString()
    @IsNotEmpty()
    coverLetter: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    bidAmount: number;

    @IsString()
    @IsNotEmpty()
    timeline: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    attachments?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    portfolioItemIds?: string[];

    @IsString()
    @IsOptional()
    invitationId?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    boostAmount?: number;

    @IsOptional()
    screeningAnswers?: any;

    @IsString()
    @IsOptional()
    specializedProfileId?: string;

    @IsString()
    @IsOptional()
    agencyId?: string;
}
