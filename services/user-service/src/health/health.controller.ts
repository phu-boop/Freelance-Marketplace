import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, PrismaHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { Unprotected } from 'nest-keycloak-connect';

@Controller('health')
@Unprotected()
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private prismaIndicator: PrismaHealthIndicator,
        private prisma: PrismaService,
    ) { }

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            () => this.prismaIndicator.pingCheck('database', this.prisma),
        ]);
    }
}
