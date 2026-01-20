import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BadgeSchedulerService {
    private readonly logger = new Logger(BadgeSchedulerService.name);

    constructor(
        private prisma: PrismaService,
        private httpService: HttpService,
        private configService: ConfigService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleBadgeVerification() {
        this.logger.log('Starting nightly badge eligibility verification...');

        // 1. Get all active freelancers
        const freelancers = await this.prisma.user.findMany({
            where: {
                roles: { has: 'FREELANCER' },
                status: 'ACTIVE',
            },
            select: { id: true },
        });

        this.logger.log(`Checking eligibility for ${freelancers.length} freelancers.`);

        const userServiceUrl = this.configService.get<string>('USER_SERVICE_INTERNAL_URL', 'http://user-service:3000/api/users');

        for (const freelancer of freelancers) {
            try {
                await firstValueFrom(
                    this.httpService.post(`${userServiceUrl}/${freelancer.id}/badges/check-eligibility`, {})
                );
            } catch (error) {
                this.logger.error(`Failed to check eligibility for user ${freelancer.id}: ${error.message}`);
            }
        }

        this.logger.log('Nightly badge verification complete.');
    }
}
