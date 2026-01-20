import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { randomUUID } from 'crypto';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
    private readonly logger = new Logger(PerformanceInterceptor.name);
    private chaosCache: any = null;
    private lastCacheUpdate = 0;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { }

    private async getChaosConfig() {
        const now = Date.now();
        if (this.chaosCache && now - this.lastCacheUpdate < 60000) {
            return this.chaosCache;
        }

        try {
            const adminServiceUrl = this.configService.get('ADMIN_SERVICE_URL', 'http://admin-service:3009');
            const res = await firstValueFrom(this.httpService.get(`${adminServiceUrl}/api/public/chaos/config`));
            this.chaosCache = res.data;
            this.lastCacheUpdate = now;
            return this.chaosCache;
        } catch (error) {
            // Default to no chaos if admin-service is down
            return { latencyEnabled: false, latencyMs: 0, errorRate: 0 };
        }
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const startTime = Date.now();

        // Distributed Trace ID
        const traceId = request.headers['x-trace-id'] || randomUUID();
        request.headers['x-trace-id'] = traceId;

        const chaos = await this.getChaosConfig();

        // Chaos: Latency Injection
        if (chaos.latencyEnabled && chaos.latencyMs > 0) {
            await new Promise(resolve => setTimeout(resolve, chaos.latencyMs));
        }

        // Chaos: Error Injection
        if (chaos.errorRate > 0 && Math.random() < chaos.errorRate) {
            throw new Error('CHAOS_LAB_EXPERIMENT: Simulated Service Failure');
        }

        return next.handle().pipe(
            tap(async () => {
                const duration = Date.now() - startTime;
                const serviceName = this.configService.get('SERVICE_NAME', 'user-service');
                const auditServiceUrl = this.configService.get('AUDIT_SERVICE_URL', 'http://audit-service:3011');

                // Log to audit-service asynchronously
                try {
                    await firstValueFrom(
                        this.httpService.post(`${auditServiceUrl}/api/audit`, {
                            service: serviceName,
                            eventType: 'PERFORMANCE_TRACE',
                            metadata: {
                                path: request.url,
                                method: request.method,
                                ip: request.ip,
                            },
                            durationMs: duration,
                            traceId,
                            status: 'success',
                        })
                    );
                } catch (error) {
                    this.logger.error(`Failed to log performance trace: ${error.message}`);
                }
            }),
        );
    }
}
