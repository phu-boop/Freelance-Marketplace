import { IsEmail, IsNotEmpty, IsOptional, IsString, IsArray, IsNumber } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    password?: string;

    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    lastName?: string;

    @IsArray()
    @IsOptional()
    roles?: string[];

    @IsString()
    @IsOptional()
    headline?: string;

    @IsString()
    @IsOptional()
    bio?: string;

    @IsNumber()
    @IsOptional()
    hourlyRate?: number;
}
