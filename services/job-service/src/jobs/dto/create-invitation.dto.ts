import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateInvitationDto {
    @IsString()
    @IsNotEmpty()
    freelancerId: string;

    @IsString()
    @IsNotEmpty()
    jobId: string;

    @IsString()
    @IsOptional()
    message?: string;
}
