import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export declare class CacheInterceptor implements NestInterceptor {
    private readonly logger;
    private readonly cache;
    private readonly TTL_MS;
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private generateKey;
}
