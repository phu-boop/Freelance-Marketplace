import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateContractDto {
    @IsString()
    @IsNotEmpty()
    job_id: string;

    @IsString()
    @IsOptional()
    freelancer_id?: string;

    @IsString()
    @IsOptional()
    client_id?: string;

    @IsString()
    @IsNotEmpty()
    proposal_id: string;

    @IsNumber()
    @IsOptional()
    totalAmount?: number;

    @IsString()
    @IsOptional()
    terms?: string;

    @IsString()
    @IsOptional()
    status?: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;
}
