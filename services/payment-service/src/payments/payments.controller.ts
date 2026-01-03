import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Request,
  StreamableFile,
  Res,
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Roles } from 'nest-keycloak-connect';
import { UpdateAutoWithdrawalDto } from './dto/update-auto-withdrawal.dto';

@Controller('')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('wallet')
  @Roles({ roles: ['realm:FREELANCER', 'realm:CLIENT'] })
  getWalletMe(@Request() req) {
    return this.paymentsService.getWallet(req.user.sub);
  }

  @Get('wallet/:userId')
  getWallet(@Param('userId') userId: string) {
    return this.paymentsService.getWallet(userId);
  }

  @Post('deposit')
  deposit(
    @Body() body: { userId: string; amount: number; referenceId: string },
  ) {
    return this.paymentsService.deposit(
      body.userId,
      body.amount,
      body.referenceId,
    );
  }

  @Post('withdraw')
  withdraw(@Body() body: { userId: string; amount: number }) {
    return this.paymentsService.withdraw(body.userId, body.amount);
  }

  @Get('withdrawal-methods')
  @Roles({ roles: ['realm:FREELANCER'] })
  getMyWithdrawalMethods(@Request() req) {
    return this.paymentsService.getWithdrawalMethods(req.user.sub);
  }

  @Post('withdrawal-methods')
  @Roles({ roles: ['realm:FREELANCER'] })
  addWithdrawalMethod(@Request() req, @Body() body: any) {
    return this.paymentsService.addWithdrawalMethod(req.user.sub, body);
  }

  @Delete('withdrawal-methods/:id')
  @Roles({ roles: ['realm:FREELANCER'] })
  deleteWithdrawalMethod(@Request() req, @Param('id') id: string) {
    return this.paymentsService.deleteWithdrawalMethod(req.user.sub, id);
  }

  @Patch('withdrawal-methods/:id/default')
  @Roles({ roles: ['realm:FREELANCER'] })
  setDefaultWithdrawalMethod(@Request() req, @Param('id') id: string) {
    return this.paymentsService.setDefaultWithdrawalMethod(req.user.sub, id);
  }

  @Get('transactions/:id/invoice')
  getInvoice(@Param('id') id: string) {
    return this.paymentsService.getInvoiceData(id);
  }

  @Post('transfer')
  transfer(
    @Body()
    body: {
      fromUserId: string;
      toUserId: string;
      amount: number;
      description: string;
      referenceId?: string;
    },
  ) {
    return this.paymentsService.transfer(
      body.fromUserId,
      body.toUserId,
      body.amount,
      body.description,
      body.referenceId,
    );
  }

  @Get('transactions/reference/:id')
  getTransactionsByReference(@Param('id') id: string) {
    return this.paymentsService.getTransactionsByReference(id);
  }

  @Get('invoices')
  @Roles({ roles: ['realm:FREELANCER', 'realm:CLIENT'] })
  getMyInvoices(@Request() req) {
    return this.paymentsService.getInvoices(req.user.sub);
  }

  @Get('invoices/:id/download')
  @Roles({ roles: ['realm:FREELANCER', 'realm:CLIENT'] })
  async downloadInvoice(
    @Param('id') id: string,
    @Res({ passthrough: true }) res,
  ) {
    const buffer = await this.paymentsService.generateInvoicePdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
    });

    return new StreamableFile(buffer);
  }

  @Get('earnings/stats')
  @Roles({ roles: ['realm:FREELANCER', 'realm:CLIENT'] })
  getEarningsStats(
    @Request() req,
    @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'monthly',
  ) {
    return this.paymentsService.getEarningsStats(req.user.sub, period);
  }

  @Patch('wallet/auto-withdrawal')
  @Roles({ roles: ['realm:FREELANCER'] })
  updateAutoWithdrawal(@Request() req, @Body() body: UpdateAutoWithdrawalDto) {
    return this.paymentsService.updateAutoWithdrawalSettings(
      req.user.sub,
      body,
    );
  }

  @Get('metrics')
  getMetrics() {
    return this.paymentsService.getMetrics();
  }
}
