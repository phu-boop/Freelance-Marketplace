import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Request,
  Res,
  Query,
  Put,
} from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { Public, Roles } from 'nest-keycloak-connect';
import { PaymentsService } from './payments.service';
import { ListTransactionsDto } from './dto/list-transactions.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { UpdateAutoWithdrawalDto } from './dto/update-auto-withdrawal.dto';

@Controller('api/payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly currencyService: CurrencyService
  ) { }

  @Public()
  @Get('exchange-rates')
  getExchangeRates(@Query('base') base?: string) {
    return this.paymentsService.getExchangeRates(base);
  }

  @Public()
  @Get('currency/convert')
  async convertCurrency(
    @Query('amount') amount: number,
    @Query('from') from: string,
    @Query('to') to: string
  ) {
    const converted = await this.currencyService.convert(Number(amount), from, to);
    const formatted = await this.currencyService.format(converted, to);
    return { amount: converted, formatted, currency: to };
  }

  @Get('metrics')
  @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
  getMetrics() {
    return this.paymentsService.getMetrics();
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
  @Roles({
    roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'],
  })
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

  @Get('agency/:id/revenue')
  @Public() // Accessible via internal calls from user-service
  getAgencyRevenue(@Param('id') id: string) {
    return this.paymentsService.getAgencyRevenue(id);
  }

  @Get('wallet/agency/:agencyId')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] })
  getAgencyWallet(@Param('agencyId') agencyId: string) {
    // In a real app, verify req.user.sub owns agencyId via user-service
    return this.paymentsService.getWallet(agencyId);
  }

  @Get('transactions/agency/:agencyId')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] })
  getAgencyTransactions(@Param('agencyId') agencyId: string, @Query() query: ListTransactionsDto) {
    // In a real app, verify requser.sub owns agencyId
    return this.paymentsService.listTransactions(agencyId, query);
  }

  @Post('withdraw/agency')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
  withdrawAgency(
    @Request() req,
    @Body() body: { agencyId: string; amount: number; methodId: string; instant?: boolean },
  ) {
    // In a real app, verify req.user.sub owns body.agencyId
    return this.paymentsService.withdraw(
      body.agencyId,
      body.amount,
      body.instant || false,
    );
  }

  @Get('connects/balance')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] })
  getConnectsBalance(@Request() req) {
    return this.paymentsService.getConnectsBalance(req.user.sub);
  }

  @Post('connects/buy')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
  buyConnects(@Request() req, @Body('amount') amount: number) {
    return this.paymentsService.buyConnects(req.user.sub, amount);
  }

  @Post('connects/purchase')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
  purchaseConnects(@Request() req, @Body() body: { bundleId: string }) {
    return this.paymentsService.purchaseConnects(req.user.sub, body.bundleId);
  }

  @Get('connects/history')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] })
  getConnectsHistory(@Request() req) {
    return this.paymentsService.getConnectsHistory(req.user.sub);
  }

  @Post('connects/reward')
  @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
  rewardConnects(@Body() body: { userId: string; amount: number; reason: string }) {
    return this.paymentsService.rewardConnects(body.userId, body.amount, body.reason);
  }

  @Post('connects/deduct')
  @Public() // Usually internal-only
  deductConnects(
    @Body() body: { userId: string; amount: number; reason: string },
  ) {
    return this.paymentsService.deductConnects(
      body.userId,
      body.amount,
      body.reason,
    );
  }

  @Post('connects/refund')
  @Public() // Internal-only
  refundConnects(
    @Body() body: { userId: string; amount: number; reason: string },
  ) {
    return this.paymentsService.refundConnects(
      body.userId,
      body.amount,
      body.reason,
    );
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
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
  withdraw(
    @Request() req,
    @Body() body: { amount: number; methodId: string; instant?: boolean },
  ) {
    return this.paymentsService.withdraw(
      req.user.sub,
      body.amount,
      body.instant || false,
    );
  }

  @Roles({
    roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'],
  })
  @Get('transactions')
  async getTransactions(@Query() query: ListTransactionsDto, @Request() req) {
    return this.paymentsService.listTransactions(req.user.sub, query);
  }

  @Roles({
    roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'],
  })
  @Get('transactions/reference/:referenceId')
  async getTransactionsByReference(@Param('referenceId') referenceId: string, @Request() req) {
    return this.paymentsService.getTransactionsByReference(referenceId);
  }

  @Roles({
    roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'],
  })
  @Get('transactions/:id')
  async getTransaction(@Param('id') id: string, @Request() req: any) {
    const roles = req.user?.realm_access?.roles || [];
    const isAdmin = roles.includes('ADMIN');
    return this.paymentsService.getTransactionById(id, req.user?.sub, isAdmin);
  }

  @Roles({ roles: ['realm:ADMIN', 'ADMIN', 'realm:MANAGER', 'MANAGER', 'realm:FINANCE', 'FINANCE'] })
  @Post('transactions/:id/approve')
  async approveTransaction(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    const roles = req.user.realm_access?.roles || [];
    return this.paymentsService.approvePayment(id, userId, roles);
  }

  @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
  @Patch('transactions/:id')
  async updateTransactionStatus(
    @Param('id') id: string,
    @Body() body: UpdateTransactionStatusDto,
    @Request() req: any,
  ) {
    return this.paymentsService.updateTransactionStatus(
      id,
      body.status,
      req.user?.sub || 'admin',
    );
  }

  @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
  @Get('admin/transactions')
  async getAllTransactionsAdmin(@Query() query: ListTransactionsDto) {
    return this.paymentsService.listTransactions(undefined, query);
  }

  @Post('methods')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
  addWithdrawalMethod(
    @Request() req,
    @Body() body: {
      type: string;
      provider: string;
      accountNumber: string;
      accountName: string;
      isDefault?: boolean;
      isInstantCapable?: boolean;
    },
  ) {
    return this.paymentsService.addWithdrawalMethod(req.user.sub, body);
  }

  @Get('methods')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
  getWithdrawalMethods(@Request() req) {
    return this.paymentsService.getWithdrawalMethods(req.user.sub);
  }

  @Delete('methods/:id')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
  deleteWithdrawalMethod(@Request() req, @Param('id') id: string) {
    return this.paymentsService.deleteWithdrawalMethod(req.user.sub, id);
  }

  @Patch('auto-withdrawal')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
  updateAutoWithdrawal(@Request() req, @Body() body: UpdateAutoWithdrawalDto) {
    return this.paymentsService.updateAutoWithdrawalSettings(
      req.user.sub,
      body,
    );
  }

  @Post('tax-settings')
  @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
  createTaxSetting(
    @Body() body: { countryCode: string; taxRate: number; name: string },
  ) {
    return this.paymentsService.createTaxSetting(body);
  }

  @Get('tax-settings')
  @Public()
  findAllTaxSettings() {
    return this.paymentsService.getTaxSettings();
  }

  @Post('subscriptions')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] })
  createSubscription(
    @Request() req,
    @Body() body: { planId: string; price: number },
  ) {
    return this.paymentsService.manageSubscription(req.user.sub, body.planId, body.price);
  }

  @Get('subscriptions/me')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] })
  getSubscription(@Request() req) {
    return this.paymentsService.getSubscription(req.user.sub);
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
  @Roles({ roles: ['realm:CLIENT'] })
  releaseEscrow(
    @Body()
    body: {
      contractId: string;
      milestoneId: string;
      freelancerId: string;
      agencyId?: string;
      agencyRevenueSplit?: any;
    },
  ) {
    return this.paymentsService.releaseEscrow(
      body.contractId,
      body.milestoneId,
      body.freelancerId,
      body.agencyId,
      body.agencyRevenueSplit,
    );
  }

  @Post('escrow/request-approval')
  @Roles({ roles: ['realm:CLIENT'] })
  requestEscrowApproval(
    @Body()
    body: {
      contractId: string;
      milestoneId: string;
      freelancerId: string;
      amount: number;
    },
  ) {
    return this.paymentsService.requestEscrowReleaseApproval(
      body.contractId,
      body.milestoneId,
      body.freelancerId,
      body.amount,
    );
  }

  @Post('escrow/split-release')
  @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
  splitEscrowRelease(
    @Body()
    body: {
      contractId: string;
      milestoneId: string;
      freelancerId: string;
      freelancerPercentage: number;
    },
  ) {
    return this.paymentsService.splitEscrowRelease(
      body.contractId,
      body.milestoneId,
      body.freelancerId,
      body.freelancerPercentage,
    );
  }

  @Post('escrow/refund')
  @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
  refundEscrow(
    @Body()
    body: {
      contractId: string;
      milestoneId: string;
    },
  ) {
    return this.paymentsService.refundEscrow(body.contractId, body.milestoneId);
  }

  // EOR
  @Post('payroll/process')
  @Roles({ roles: ['realm:ADMIN', 'ADMIN', 'realm:CLIENT', 'CLIENT'] })
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

  @Get('payroll/preview')
  @Roles({ roles: ['realm:ADMIN', 'ADMIN', 'realm:CLIENT', 'CLIENT'] })
  previewPayroll(
    @Query('contractId') contractId: string,
    @Query('grossAmount') grossAmount: number,
    @Query('employeeId') employeeId: string,
  ) {
    return this.paymentsService.calculatePayroll(
      contractId,
      Number(grossAmount),
      employeeId,
    );
  }

  @Post('transfer')
  @Public() // Internal or restricted, but contract-service needs it
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
      costCenter?: string;
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
      body.costCenter,
    );
  }

  @Post('arbitration/deduct')
  @Public()
  deductArbitrationFee(
    @Body() body: { userId: string; amount: number; contractId: string },
  ) {
    return this.paymentsService.deductArbitrationFee(
      body.userId,
      body.amount,
      body.contractId,
    );
  }
}
