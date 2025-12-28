import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class CreateJobAlertDto {
    @IsOptional()
    @IsString()
    keyword?: string;

    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @IsOptional()
    @IsNumber()
    minBudget?: number;

    @IsOptional()
    @IsNumber()
    maxBudget?: number;

    @IsOptional()
    @IsString()
    experienceLevel?: string;

    @IsOptional()
    @IsString()
    locationType?: string;
}
