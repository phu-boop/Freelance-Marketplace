import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateProposalDto {
    @IsString()
    @IsNotEmpty()
    job_id: string;

    @IsString()
    @IsNotEmpty()
    freelancer_id: string;

    @IsString()
    @IsNotEmpty()
    coverLetter: string;

    @IsNumber()
    @IsNotEmpty()
    bidAmount: number;

    @IsString()
    @IsOptional()
    status?: string;

    @IsNumber()
    @IsOptional()
    boostAmount?: number;
}
