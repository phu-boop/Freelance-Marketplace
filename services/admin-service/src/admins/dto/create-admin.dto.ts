import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class CreateAdminDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @IsNotEmpty()
    role: string;
}
