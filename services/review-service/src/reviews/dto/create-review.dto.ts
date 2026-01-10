import { IsString, IsNotEmpty, IsInt, IsOptional, Min, Max } from 'class-validator';

export class CreateReviewDto {
    @IsString()
    @IsNotEmpty()
    reviewer_id: string;

    @IsString()
    @IsNotEmpty()
    reviewee_id: string;

    @IsString()
    @IsNotEmpty()
    job_id: string;

    @IsString()
    @IsNotEmpty()
    contract_id: string;

    @IsInt()
    @Min(1)
    @Max(5)
    ratingOverall: number;

    @IsInt()
    @Min(1)
    @Max(5)
    ratingCommunication: number;

    @IsInt()
    @Min(1)
    @Max(5)
    ratingQuality: number;

    @IsInt()
    @Min(1)
    @Max(5)
    ratingValue: number;

    @IsInt()
    @Min(1)
    @Max(5)
    ratingSchedule: number;

    @IsString()
    @IsOptional()
    comment?: string;
}
