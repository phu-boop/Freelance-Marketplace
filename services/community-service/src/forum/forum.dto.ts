import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsUUID()
    @IsNotEmpty()
    categoryId: string;

    @IsArray()
    @IsOptional()
    tags?: string[];
}

export class CreateCommentDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsUUID()
    @IsOptional()
    parentId?: string;
}
