import { IsString, IsOptional, IsNumber, IsArray, IsBoolean } from 'class-validator';

export class CreateSpecializedProfileDto {
    @IsString()
    headline: string;

    @IsString()
    bio: string;

    @IsNumber()
    hourlyRate: number;

    @IsArray()
    @IsString({ each: true })
    skills: string[];

    @IsString()
    @IsOptional()
    primaryCategoryId?: string;

    @IsBoolean()
    @IsOptional()
    isDefault?: boolean;
}
