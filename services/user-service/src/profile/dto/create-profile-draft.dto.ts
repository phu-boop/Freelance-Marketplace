// src/profile/dto/create-profile-draft.dto.ts
import { IsOptional, IsString, IsArray, IsBoolean, IsNumber } from 'class-validator';

export class CreateProfileDraftDto {
    @IsOptional()
    @IsString()
    headline?: string;

    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsNumber()
    hourlyRate?: number;

    @IsOptional()
    @IsArray()
    skills?: string[];

    @IsOptional()
    @IsString()
    primaryCategoryId?: string;
}
