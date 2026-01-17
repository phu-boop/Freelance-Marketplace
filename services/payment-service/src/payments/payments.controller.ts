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
import { Roles, Public } from 'nest-keycloak-connect';
import { UpdateAutoWithdrawalDto } from './dto/update-auto-withdrawal.dto';
import { GetTransactionDto } from './dto/get-transaction.dto';
import { ListTransactionsDto } from './dto/list-transactions.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Public()
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
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] })
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
    return this.paymentsService.deposit(body.userId, body.amount, body.referenceId);
  }

  @Post('withdraw')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
  withdraw(
    @Request() req,
    @Body() body: { amount: number; methodId: string; instant?: boolean },
  ) {
    return this.paymentsService.withdraw(req.user.sub, body.amount, body.instant || false);
  }

  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] })
  @Get('transactions')
  async getTransactions(@Query() query: ListTransactionsDto, @Request() req) {
    return this.paymentsService.listTransactions(req.user.sub, query);
  }

  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] })
  @Get('transactions/:id')
  async getTransaction(@Param('id') id: string) {
    return this.paymentsService.getTransactionById(id);
  }

  @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
  @Patch('transactions/:id')
  async updateTransactionStatus(
    @Param('id') id: string,
    @Body() body: UpdateTransactionStatusDto,
  ) {
    return this.paymentsService.updateTransactionStatus(id, body.status);
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
    @Body() body: { type: string; details: any; isDefault?: boolean },
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
  updateAutoWithdrawal(
    @Request() req,
    @Body() body: UpdateAutoWithdrawalDto,
  ) {
    return this.paymentsService.updateAutoWithdrawalSettings(req.user.sub, body);
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
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
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
  @Roles({ roles: ['realm:CLIENT'] })
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
  @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
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
}
