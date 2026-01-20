import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ContractsService } from './contracts.service';
import { DisputesService } from './disputes.service';

@Injectable()
export class EscrowSchedulerService {
  private readonly logger = new Logger(EscrowSchedulerService.name);

  constructor(
    private readonly contractsService: ContractsService,
    private readonly disputesService: DisputesService
  ) { }

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

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleEvidenceCleanup() {
    this.logger.log('Running evidence cleanup cron job...');
    await this.disputesService.cleanupOldEvidence();
  }
}
