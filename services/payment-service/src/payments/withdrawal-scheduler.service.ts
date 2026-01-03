import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WithdrawalSchedulerService {
  private readonly logger = new Logger(WithdrawalSchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private paymentsService: PaymentsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleAutoWithdrawals() {
    this.logger.log('Starting automatic withdrawal processing...');

    const wallets = await this.prisma.wallet.findMany({
      where: { autoWithdrawalEnabled: true },
    });

    const now = new Date();
    const isMonday = now.getUTCDay() === 1;
    const isFirstOfMonth = now.getUTCDate() === 1;

    for (const wallet of wallets) {
      try {
        // 1. Check schedule
        if (wallet.autoWithdrawalSchedule === 'WEEKLY' && !isMonday) continue;
        if (wallet.autoWithdrawalSchedule === 'MONTHLY' && !isFirstOfMonth)
          continue;

        // 2. Check balance threshold
        const balance = Number(wallet.balance);
        const threshold = wallet.autoWithdrawalThreshold
          ? Number(wallet.autoWithdrawalThreshold)
          : 0;

        if (balance <= 0 || balance < threshold) continue;

        // 3. Trigger withdrawal
        this.logger.log(
          `Triggering auto-withdrawal for user ${wallet.userId} - Amount: $${balance}`,
        );

        // Use the existing withdraw method.
        // In a real app, we would pass the methodId to the payment gateway.
        await this.paymentsService.withdraw(wallet.userId, balance);

        this.logger.log(
          `Successfully processed auto-withdrawal for user ${wallet.userId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to process auto-withdrawal for user ${wallet.userId}: ${error.message}`,
        );
      }
    }

    this.logger.log('Finished automatic withdrawal processing.');
  }
}
