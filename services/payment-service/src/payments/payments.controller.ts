import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
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

  @Get('withdrawal-methods/:userId')
  getWithdrawalMethods(@Param('userId') userId: string) {
    return this.paymentsService.getWithdrawalMethods(userId);
  }

  @Post('withdrawal-methods')
  addWithdrawalMethod(@Body() body: { userId: string; data: any }) {
    return this.paymentsService.addWithdrawalMethod(body.userId, body.data);
  }

  @Delete('withdrawal-methods/:userId/:id')
  deleteWithdrawalMethod(@Param('userId') userId: string, @Param('id') id: string) {
    return this.paymentsService.deleteWithdrawalMethod(userId, id);
  }

  @Patch('withdrawal-methods/:userId/:id/default')
  setDefaultWithdrawalMethod(@Param('userId') userId: string, @Param('id') id: string) {
    return this.paymentsService.setDefaultWithdrawalMethod(userId, id);
  }

  @Get('transactions/:id/invoice')
  getInvoice(@Param('id') id: string) {
    return this.paymentsService.getInvoiceData(id);
  }

  @Post('transfer')
  transfer(@Body() body: { fromUserId: string; toUserId: string; amount: number; description: string }) {
    return this.paymentsService.transfer(body.fromUserId, body.toUserId, body.amount, body.description);
  }

  @Get('metrics')
  getMetrics() {
    return this.paymentsService.getMetrics();
  }
}
