import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateChatDto {
    @IsString()
    @IsNotEmpty()
    senderId: string;

    @IsString()
    @IsNotEmpty()
    receiverId: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsOptional()
    contractId?: string;

    @IsOptional()
    attachments?: string[];

    @IsString()
    @IsOptional()
    replyTo?: string;
}
