import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
    ) { }

    @Get()
    @HealthCheck()
    check() {
        // For storage, we could add a Minio health check if there's an indicator, 
        // but for now we'll just do a basic check.
        return this.health.check([]);
    }
}
