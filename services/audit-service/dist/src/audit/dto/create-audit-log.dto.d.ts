export declare class CreateAuditLogDto {
    service: string;
    eventType: string;
    actorId?: string;
    amount?: number;
    metadata?: any;
    referenceId?: string;
    durationMs?: number;
    traceId?: string;
    status?: string;
}
