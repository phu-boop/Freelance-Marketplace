import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, PrismaHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from 'nest-keycloak-connect';

@Controller('health')
@Public()
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
