import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateCourseDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsOptional()
    thumbnail?: string;

    @IsString()
    @IsOptional()
    badgeName?: string;
}

export class CreateLessonDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsInt()
    @Min(0)
    order: number;

    @IsInt()
    @Min(1)
    duration: number;
}
