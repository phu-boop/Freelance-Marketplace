import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ContractsService } from './contracts.service';

@Injectable()
export class EscrowSchedulerService {
    private readonly logger = new Logger(EscrowSchedulerService.name);

    constructor(private readonly contractsService: ContractsService) { }

    @Cron(CronExpression.EVERY_6_HOURS)
    async handleAutoRelease() {
        this.logger.log('Running auto-release cron job...');
        await this.contractsService.autoReleaseMilestones();
    }

    @Cron(CronExpression.EVERY_12_HOURS)
    async handleDisputeTimeouts() {
        this.logger.log('Running dispute timeout cron job...');
        await this.contractsService.handleDisputeTimeouts();
    }
}
