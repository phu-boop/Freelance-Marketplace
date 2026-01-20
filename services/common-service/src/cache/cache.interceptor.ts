import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
    private readonly logger = new Logger(CacheInterceptor.name);
    // Mock Redis: In-memory storage
    private readonly cache = new Map<string, { data: any; expires: number }>();
    private readonly TTL_MS = 60 * 1000; // 60 seconds

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        // Only cache GET requests
        if (request.method !== 'GET') {
            return next.handle();
        }

        const key = this.generateKey(request);
        const cached = this.cache.get(key);

        if (cached) {
            if (Date.now() < cached.expires) {
                this.logger.log(`[Cache] HIT for ${key}`);
                return of(cached.data);
            } else {
                this.logger.log(`[Cache] EXPIRED for ${key}`);
                this.cache.delete(key);
            }
        }

        this.logger.log(`[Cache] MISS for ${key}`);
        return next.handle().pipe(
            tap((data) => {
                this.cache.set(key, {
                    data,
                    expires: Date.now() + this.TTL_MS,
                });
            }),
        );
    }

    private generateKey(request: any): string {
        return `${request.url}`;
    }
}
