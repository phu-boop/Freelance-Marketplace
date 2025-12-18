import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Get('wallet/:userId')
  getWallet(@Param('userId') userId: string) {
    return this.paymentsService.getWallet(userId);
  }

  @Post('deposit')
  deposit(@Body() body: { userId: string; amount: number; referenceId: string }) {
    return this.paymentsService.deposit(body.userId, body.amount, body.referenceId);
  }

  @Post('withdraw')
  withdraw(@Body() body: { userId: string; amount: number }) {
    return this.paymentsService.withdraw(body.userId, body.amount);
  }
}
