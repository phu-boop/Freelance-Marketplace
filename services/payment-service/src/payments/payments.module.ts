import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { WithdrawalSchedulerService } from './withdrawal-scheduler.service';

@Module({
  imports: [HttpModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, WithdrawalSchedulerService],
})
export class PaymentsModule {}
