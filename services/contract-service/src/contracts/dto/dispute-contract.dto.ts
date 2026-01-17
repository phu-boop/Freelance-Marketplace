import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class DisputeContractDto {
    @IsString()
    @IsNotEmpty()
    reason: string;

    @IsArray()
    @IsOptional()
    evidence?: string[];
}
