import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { CurrencyConverterService } from './currency-converter.service';
import { WithdrawalSchedulerService } from './withdrawal-scheduler.service';
import { SubscriptionSchedulerService } from './subscription-scheduler.service';
import { RegionalGatewayService } from './regional-gateway.service';
import { TaxCalculationService } from './tax-calculation.service';
import { PayrollSchedulerService } from './payroll-scheduler.service';

import { CurrencyService } from './currency.service';

@Module({
  imports: [HttpModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    WithdrawalSchedulerService,
    SubscriptionSchedulerService,
    CurrencyConverterService,
    CurrencyService,
    RegionalGatewayService,
    TaxCalculationService,
    PayrollSchedulerService,
  ],
})
export class PaymentsModule { }
