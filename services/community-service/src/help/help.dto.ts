import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateHelpArticleDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    slug: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsArray()
    @IsOptional()
    keywords?: string[];

    @IsBoolean()
    @IsOptional()
    isPublic?: boolean;
}

export class CreateSupportTicketDto {
    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsOptional()
    priority?: string;
}

export class SearchHelpDto {
    @IsString()
    @IsNotEmpty()
    query: string;
}
