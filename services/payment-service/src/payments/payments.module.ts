import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { CurrencyConverterService } from './currency-converter.service';

@Module({
  imports: [HttpModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, WithdrawalSchedulerService, CurrencyConverterService],
})
export class PaymentsModule { }
