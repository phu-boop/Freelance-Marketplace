// src/profile/dto/create-profile-draft.dto.ts
import { IsOptional, IsString, IsArray, IsNumber, ValidateNested, IsBoolean, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

class EducationDto {
    @IsString()
    institution: string;

    @IsString()
    degree: string;

    @IsString()
    fieldOfStudy: string;

    @IsDateString()
    startDate: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsString()
    description?: string;
}

class ExperienceDto {
    @IsString()
    company: string;

    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsDateString()
    startDate: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsBoolean()
    current?: boolean;

    @IsOptional()
    @IsString()
    description?: string;
}

class PortfolioDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsString()
    imageUrl: string;

    @IsOptional()
    @IsString()
    projectUrl?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    skills?: string[];
}

export class CreateProfileDraftDto {
    @IsOptional()
    @IsString()
    firstName?: string;

    @IsOptional()
    @IsString()
    lastName?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    avatarUrl?: string;

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
    @IsString({ each: true })
    skills?: string[];

    @IsOptional()
    @IsString()
    primaryCategoryId?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EducationDto)
    education?: EducationDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ExperienceDto)
    experience?: ExperienceDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PortfolioDto)
    portfolio?: PortfolioDto[];
}
