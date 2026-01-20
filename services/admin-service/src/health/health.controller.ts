import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, PrismaHealthIndicator, HttpHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private prismaIndicator: PrismaHealthIndicator,
        private http: HttpHealthIndicator,
        private prisma: PrismaService,
    ) { }

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            () => this.prismaIndicator.pingCheck('database', this.prisma),
            () => this.http.pingCheck('user-service', 'http://user-service:3000/health'),
            () => this.http.pingCheck('job-service', 'http://job-service:3002/health'),
            () => this.http.pingCheck('proposal-service', 'http://proposal-service:3003/health'),
            () => this.http.pingCheck('contract-service', 'http://contract-service:3004/health'),
            () => this.http.pingCheck('payment-service', 'http://payment-service:3005/health'),
            () => this.http.pingCheck('chat-service', 'http://chat-service:3006/health'),
            () => this.http.pingCheck('notification-service', 'http://notification-service:3007/health'),
            () => this.http.pingCheck('review-service', 'http://review-service:3008/health'),
            () => this.http.pingCheck('search-service', 'http://search-service:3010/health'),
            () => this.http.pingCheck('community-service', 'http://community-service:3015/health'),
            () => this.http.pingCheck('audit-service', 'http://audit-service:3011/health'),
            () => this.http.pingCheck('analytics-service', 'http://analytics-service:3014/ping'),
        ]);
    }
}
