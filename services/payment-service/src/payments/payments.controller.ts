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
  Put,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Roles } from 'nest-keycloak-connect';
import { UpdateAutoWithdrawalDto } from './dto/update-auto-withdrawal.dto';

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Get('exchange-rates')
  getExchangeRates(@Query('base') base?: string) {
    return this.paymentsService.getExchangeRates(base);
  }

  @Patch('wallet/crypto-address')
  @Roles({ roles: ['realm:FREELANCER', 'realm:CLIENT'] })
  updateCryptoAddress(@Request() req, @Body('address') address: string) {
    return this.paymentsService.updateCryptoAddress(req.user.sub, address);
  }

  @Patch('wallet/currency')
  @Roles({ roles: ['realm:FREELANCER', 'realm:CLIENT'] })
  updatePreferredCurrency(@Request() req, @Body('currency') currency: string) {
    return this.paymentsService.updatePreferredCurrency(req.user.sub, currency);
  }

  @Get('wallet')
  @Roles({ roles: ['realm:FREELANCER', 'realm:CLIENT'] })
  getWalletMe(@Request() req) {
    return this.paymentsService.getWallet(req.user.sub);
  }

  @Get('wallet/:userId')
  getWallet(@Param('userId') userId: string) {
    return this.paymentsService.getWallet(userId);
  }

  @Get('revenue/predictive/:userId')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
  getPredictiveRevenue(@Param('userId') userId: string) {
    return this.paymentsService.getPredictiveRevenue(userId);
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
  withdraw(
    @Body() body: { userId: string; amount: number; instant?: boolean },
  ) {
    return this.paymentsService.withdraw(
      body.userId,
      body.amount,
      body.instant,
    );
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

  @Post('withdrawal-methods/:id/verify-instant')
  @Roles({ roles: ['realm:FREELANCER'] })
  verifyInstantPay(@Request() req, @Param('id') id: string) {
    return this.paymentsService.verifyInstantCapability(req.user.sub, id);
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
      teamId?: string;
      departmentId?: string;
    },
  ) {
    return this.paymentsService.transfer(
      body.fromUserId,
      body.toUserId,
      body.amount,
      body.description,
      body.referenceId,
      body.teamId,
      body.departmentId,
    );
  }

  @Get('departments/:id/spend')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  getDepartmentSpend(@Param('id') id: string) {
    return this.paymentsService.getDepartmentSpend(id);
  }

  @Get('transactions/reference/:id')
  getTransactionsByReference(@Param('id') id: string) {
    return this.paymentsService.getTransactionsByReference(id);
  }

  @Get('transactions')
  // @Roles({ roles: ['realm:ADMIN'] }) // In prod, protect this
  getAllTransactions(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
  ) {
    return this.paymentsService.getAllTransactions(limit, offset);
  }

  @Post('transactions/:id/chargeback')
  // @Roles({ roles: ['realm:ADMIN'] })
  chargebackTransaction(@Param('id') id: string) {
    return this.paymentsService.processChargeback(id);
  }

  @Post('transactions/:id/approve')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  approvePayment(@Param('id') id: string, @Request() req) {
    return this.paymentsService.approvePayment(id, req.user.sub);
  }

  @Post('taxes')
  // @Roles({ roles: ['realm:ADMIN'] })
  createTaxSetting(
    @Body() body: { countryCode: string; taxRate: number; name: string },
  ) {
    return this.paymentsService.createTaxSetting(body);
  }

  @Get('taxes')
  getTaxSettings() {
    return this.paymentsService.getTaxSettings();
  }

  @Put('taxes/:id')
  // @Roles({ roles: ['realm:ADMIN'] })
  updateTaxSetting(
    @Param('id') id: string,
    @Body() body: { taxRate?: number; isActive?: boolean },
  ) {
    return this.paymentsService.updateTaxSetting(id, body);
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

  @Get('spending/stats')
  @Roles({ roles: ['realm:CLIENT'] })
  getSpendingStats(
    @Request() req,
    @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'monthly',
  ) {
    return this.paymentsService.getSpendingStats(req.user.sub, period);
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

  @Get('methods')
  @Roles({ roles: ['realm:CLIENT'] })
  getMyPaymentMethods(@Request() req) {
    return this.paymentsService.getPaymentMethods(req.user.sub);
  }

  @Post('methods')
  @Roles({ roles: ['realm:CLIENT'] })
  addPaymentMethod(@Request() req, @Body() body: any) {
    return this.paymentsService.addPaymentMethod(req.user.sub, body);
  }

  @Delete('methods/:id')
  @Roles({ roles: ['realm:CLIENT'] })
  deletePaymentMethod(@Request() req, @Param('id') id: string) {
    return this.paymentsService.deletePaymentMethod(req.user.sub, id);
  }

  @Post('auto-deposit/config')
  @Roles({ roles: ['realm:CLIENT'] })
  updateAutoDepositConfig(
    @Request() req,
    @Body()
    body: {
      enabled: boolean;
      threshold?: number;
      amount?: number;
      paymentMethodId?: string;
    },
  ) {
    return this.paymentsService.updateAutoDepositConfig(req.user.sub, body);
  }

  @Get('tax-documents/:year')
  @Roles({ roles: ['realm:FREELANCER', 'realm:CLIENT'] })
  async getTaxDocument(
    @Request() req,
    @Param('year') year: string,
    @Res({ passthrough: true }) res,
  ) {
    const buffer = await this.paymentsService.generateTaxDocumentPdf(
      req.user.sub,
      parseInt(year),
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="tax-summary-${year}.pdf"`,
    });
    return new StreamableFile(buffer);
  }

  @Post('subscriptions')
  @Roles({ roles: ['realm:FREELANCER', 'realm:CLIENT'] })
  createSubscription(
    @Request() req,
    @Body() body: { planId: string; price: number },
  ) {
    return this.paymentsService.createSubscription(req.user.sub, body);
  }

  // Escrow
  @Post('escrow/fund')
  @Roles({ roles: ['realm:CLIENT'] })
  fundEscrow(
    @Request() req,
    @Body() body: { contractId: string; milestoneId: string; amount: number },
  ) {
    return this.paymentsService.fundEscrow(req.user.sub, body);
  }

  @Post('escrow/release')
  @Roles({ roles: ['realm:CLIENT'] }) // Only client can release? Or maybe system? Let's assume client for now.
  releaseEscrow(
    @Body()
    body: {
      contractId: string;
      milestoneId: string;
      freelancerId: string;
    },
  ) {
    return this.paymentsService.releaseEscrow(
      body.contractId,
      body.milestoneId,
      body.freelancerId,
    );
  }

  // EOR
  @Post('payroll/process')
  @Roles({ roles: ['realm:ADMIN', 'ADMIN'] }) // Admin triggers payroll? Or automated system
  processPayroll(
    @Body()
    body: {
      contractId: string;
      periodStart: string;
      periodEnd: string;
      grossAmount: number;
      employeeId: string;
    },
  ) {
    return this.paymentsService.processPayroll(body.contractId, {
      ...body,
      periodStart: new Date(body.periodStart),
      periodEnd: new Date(body.periodEnd),
    });
  }
}
