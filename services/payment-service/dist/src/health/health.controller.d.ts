import { HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
export declare class HealthController {
    private health;
    private prismaIndicator;
    private prisma;
    constructor(health: HealthCheckService, prismaIndicator: PrismaHealthIndicator, prisma: PrismaService);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
