import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsUUID } from 'class-validator';

export class CreateJobDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @IsOptional()
    budget?: number;

    @IsString()
    @IsNotEmpty()
    client_id: string;

    @IsArray()
    @IsUUID('4', { each: true })
    @IsOptional()
    skillIds?: string[];

    @IsUUID()
    @IsOptional()
    categoryId?: string;

    @IsString()
    @IsOptional()
    type?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    attachments?: string[];
}
