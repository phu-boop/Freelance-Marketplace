import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateContractDto {
    @IsString()
    @IsNotEmpty()
    job_id: string;

    @IsString()
    @IsNotEmpty()
    freelancer_id: string;

    @IsString()
    @IsNotEmpty()
    client_id: string;

    @IsString()
    @IsNotEmpty()
    proposal_id: string;

    @IsNumber()
    @IsNotEmpty()
    totalAmount: number;

    @IsString()
    @IsOptional()
    status?: string;

    @IsDateString()
    @IsOptional()
    endDate?: string;
}
