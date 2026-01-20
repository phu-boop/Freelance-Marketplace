import { IsString, IsOptional, IsNumber, IsObject, IsNotEmpty } from 'class-validator';

export class CreateAuditLogDto {
    @IsString()
    @IsNotEmpty()
    service: string;

    @IsString()
    @IsNotEmpty()
    eventType: string;

    @IsString()
    @IsOptional()
    actorId?: string;

    @IsNumber()
    @IsOptional()
    amount?: number;

    @IsObject()
    @IsOptional()
    metadata?: any;

    @IsString()
    @IsOptional()
    referenceId?: string;

    @IsNumber()
    @IsOptional()
    durationMs?: number;

    @IsString()
    @IsOptional()
    traceId?: string;

    @IsString()
    @IsOptional()
    status?: string;
}
