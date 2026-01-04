import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobsService } from './jobs.service';

@Injectable()
export class EscrowSchedulerService {
    private readonly logger = new Logger(EscrowSchedulerService.name);

    constructor(private readonly jobsService: JobsService) { }

    @Cron(CronExpression.EVERY_6_HOURS)
    async handleAutoRelease() {
        this.logger.log('Running auto-release cron job in Job Service...');
        await this.jobsService.autoReleaseMilestones();
    }
}
