import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import Decimal = Prisma.Decimal;
import PDFDocument from 'pdfkit';
import { getISOWeek } from 'date-fns';

import { CurrencyConverterService } from './currency-converter.service';
import { RegionalGatewayService } from './regional-gateway.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private configService: ConfigService,
    private currencyConverter: CurrencyConverterService,
    private regionalGateway: RegionalGatewayService,
  ) { }

  async updateCryptoAddress(userId: string, cryptoAddress: string) {
    const wallet = await this.getWallet(userId);
    return this.prisma.wallet.update({
      where: { id: wallet.id },
      data: { cryptoAddress },
    });
  }

  async updatePreferredCurrency(userId: string, preferredCurrency: string) {
    const wallet = await this.getWallet(userId);
    return this.prisma.wallet.update({
      where: { id: wallet.id },
      data: { preferredCurrency },
    });
  }

  async getExchangeRates(base?: string) {
    return this.currencyConverter.getExchangeRates(base);
  }

  async createWallet(userId: string) {
    return this.prisma.wallet.create({
      data: { userId },
    });
  }

  async getWallet(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: { transactions: { orderBy: { createdAt: 'desc' } } },
    });

    if (!wallet) {
      // Auto-create if not exists for simplicity in MVP
      return this.createWallet(userId);
    }

    // Lazy clearing: Move cleared pending transactions to available balance
    const now = new Date();
    const pendingCleared = wallet.transactions.filter(
      (tx: any) =>
        tx.status === 'PENDING' &&
        tx.clearedAt &&
        new Date(tx.clearedAt) <= now,
    );

    if (pendingCleared.length > 0) {
      const walletId = wallet.id;
      await this.prisma.$transaction(async (prisma) => {
        for (const tx of pendingCleared) {
          // Decrement pending, increment available
          await prisma.wallet.update({
            where: { id: walletId },
            data: {
              pendingBalance: { decrement: tx.amount },
              balance: { increment: tx.amount },
            } as any,
          });

          // Mark transaction as COMPLETED
          await prisma.transaction.update({
            where: { id: tx.id },
            data: { status: 'COMPLETED' },
          });
        }
      });

      // Refetch wallet after updates
      const updatedWallet = await this.prisma.wallet.findUnique({
        where: { userId },
        include: { transactions: { orderBy: { createdAt: 'desc' } } },
      });
      return updatedWallet!;
    }

    return wallet;
  }

  async deposit(userId: string, amount: number, referenceId: string) {
    const wallet = await this.getWallet(userId);
    if (!wallet) throw new NotFoundException('Wallet not found');

    return this.prisma.$transaction(async (prisma) => {
      const updatedWallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { increment: amount } },
      });

      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          amount: amount,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          referenceId,
          description: 'Deposit via Payment Gateway',
        },
      });

      const config = await this.getPaymentGatewayConfig(); // Mock: assume 'STRIPE' or default
      // Check if gateway is configured. For MVP, warning only.
      if (!config) {
        this.logger.warn(
          'No Payment Gateway configuration found. Deposits might fail in production.',
        );
      }

      await this.logFinancialEvent({
        service: 'payment-service',
        eventType: 'DEPOSIT_COMPLETED',
        actorId: userId,
        amount: amount,
        referenceId,
        metadata: {
          type: 'DEPOSIT',
          description: 'Deposit via Payment Gateway',
        },
      });

      return updatedWallet;
    });
  }

  async withdraw(userId: string, amount: number, instant: boolean = false) {
    const wallet = await this.getWallet(userId);
    if (!wallet) throw new NotFoundException('Wallet not found');

    if (Number(wallet.balance) < amount) {
      throw new BadRequestException('Insufficient funds');
    }

    let fee = 0;
    let description = 'Withdrawal to Bank Account';
    let status = 'COMPLETED'; // Default for MVP

    if (instant) {
      // 1. Check for Instant-Capable default method
      const defaultMethod = await this.prisma.withdrawalMethod.findFirst({
        where: { userId, isDefault: true },
      });

      if (!defaultMethod) {
        throw new BadRequestException('No default withdrawal method found');
      }

      if (!defaultMethod.isInstantCapable) {
        throw new BadRequestException(
          'Default withdrawal method is not eligible for Instant Pay',
        );
      }

      // 2. Apply Instant Fee (1.5% or min $2.00)
      const calculatedFee = amount * 0.015;
      fee = Math.max(calculatedFee, 2.0);

      if (Number(wallet.balance) < amount + fee) {
        throw new BadRequestException(
          `Insufficient funds to cover withdrawal plus instant fee of $${fee.toFixed(2)}`,
        );
      }

      description = 'Instant Withdrawal to Debit Card';
      status = 'INSTANT_PROCESSED';
    }

    return this.prisma.$transaction(async (prisma) => {
      const totalDeduction = amount + fee;

      const updatedWallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: totalDeduction } },
      });

      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          amount: totalDeduction, // Total amount deducted
          feeAmount: fee, // Track fee
          type: 'WITHDRAWAL',
          status,
          description,
        },
      });

      // 5. Simulate External Payout (Story L-001)
      const defaultMethod = await prisma.withdrawalMethod.findFirst({
        where: { userId, isDefault: true },
      });

      if (defaultMethod) {
        const regionalTypes = ['MOMO', 'PIX', 'PROMPTPAY', 'M_PESA'];
        if (regionalTypes.includes(defaultMethod.type)) {
          await this.regionalGateway.processRegionalPayout(
            userId,
            amount,
            defaultMethod.id,
          );
        }
      }

      await this.logFinancialEvent({
        service: 'payment-service',
        eventType: instant
          ? 'INSTANT_WITHDRAW_COMPLETED'
          : 'WITHDRAW_COMPLETED',
        actorId: userId,
        amount: amount,
        metadata: {
          type: 'WITHDRAWAL',
          description,
          instant,
          fee,
          method: defaultMethod?.type,
        },
      });

      return updatedWallet;
    });
  }

  async getInvoiceData(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        wallet: true,
        invoice: true,
      },
    });

    if (!transaction) throw new NotFoundException('Transaction not found');
    if (!transaction.wallet)
      throw new NotFoundException('Wallet for transaction not found');

    return {
      invoiceNumber:
        transaction.invoice?.invoiceNumber ||
        `INV-${transaction.id.slice(0, 8).toUpperCase()}`,
      date: transaction.createdAt,
      amount: transaction.amount,
      feeAmount: transaction.feeAmount,
      taxAmount: transaction.taxAmount,
      totalAmount:
        Number(transaction.amount) +
        Number(transaction.feeAmount) +
        Number(transaction.taxAmount),
      type: transaction.type,
      description: transaction.description,
      status: transaction.status,
      userId: transaction.wallet.userId,
    };
  }

  async transfer(
    fromUserId: string,
    toUserId: string,
    amount: number,
    description: string,
    referenceId?: string,
    teamId?: string,
    departmentId?: string,
  ) {
    const fromWallet = await this.getWallet(fromUserId);
    const toWallet = await this.getWallet(toUserId);

    if (!fromWallet || !toWallet) {
      throw new NotFoundException('Wallet not found for user');
    }

    if (Number(fromWallet.balance) < amount) {
      throw new BadRequestException('Insufficient funds in source wallet');
    }

    // Platform Fee Calculation
    const feeRatePercent = await this.getPlatformFeePercent();
    const feeRate = feeRatePercent / 100;
    const feeAmount = amount * feeRate;
    const netAmount = amount - feeAmount;

    return this.prisma.$transaction(async (prisma) => {
      // Deduct GROSS amount from source (Client)
      await prisma.wallet.update({
        where: { id: fromWallet.id },
        data: { balance: { decrement: amount } },
      });

      let status = 'COMPLETED';
      if (teamId) {
        const approvalCheck = await this.checkApproval(
          teamId,
          'PAYMENT',
          amount,
        );
        if (approvalCheck.required) {
          status = 'PENDING_APPROVAL';
        }
      }

      const senderTx = await prisma.transaction.create({
        data: {
          walletId: fromWallet.id,
          amount: amount,
          type: 'PAYMENT',
          status,
          description: `Payment to ${toUserId}: ${description}`,
          referenceId,
          departmentId,
        },
      });

      if (status === 'PENDING_APPROVAL') {
        await prisma.paymentApprovalRequest.create({
          data: {
            transactionId: senderTx.id,
            requestedBy: fromUserId,
            status: 'PENDING',
          },
        });
        return {
          success: true,
          status: 'PENDING_APPROVAL',
          transactionId: senderTx.id,
        };
      }

      const invoice = await this.processRecipientCredit(
        prisma,
        fromUserId,
        toUserId,
        amount,
        feeAmount,
        netAmount,
        description,
        referenceId,
      );

      await this.logFinancialEvent({
        service: 'payment-service',
        eventType: 'TRANSFER_COMPLETED',
        actorId: fromUserId,
        amount: amount,
        referenceId,
        metadata: {
          toUserId,
          description,
          grossAmount: amount,
          feeAmount,
          netAmount,
          invoiceId: invoice.id,
        },
      });

      return { success: true, invoiceId: invoice.id };
    });
  }

  async getTransactionsByReference(referenceId: string) {
    return this.prisma.transaction.findMany({
      where: { referenceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllTransactions(limit = 100, offset = 0) {
    return this.prisma.transaction.findMany({
      take: Number(limit),
      skip: Number(offset),
      include: {
        wallet: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMetrics() {
    const transactions = await this.prisma.transaction.findMany({
      where: { status: 'COMPLETED' },
    });

    const totalVolume = transactions.reduce(
      (acc, tx) => acc + Number(tx.amount),
      0,
    );
    const totalPayments = transactions.filter(
      (tx) => tx.type === 'PAYMENT',
    ).length;
    const totalWithdrawals = transactions.filter(
      (tx) => tx.type === 'WITHDRAWAL',
    ).length;

    return {
      totalVolume,
      totalPayments,
      totalWithdrawals,
      transactionCount: transactions.length,
    };
  }

  async getInvoices(userId: string) {
    // Return invoices where user is either sender or receiver
    return this.prisma.invoice.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async generateInvoicePdf(invoiceId: string): Promise<Buffer> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(25).text('INVOICE', 50, 50);
      doc
        .fontSize(12)
        .text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'right' });
      doc.text(`Date: ${invoice.createdAt.toDateString()}`, { align: 'right' });
      doc.moveDown();

      // Details
      doc.fontSize(14).text('From:', 50, 150);
      doc.fontSize(10).text(invoice.senderId); // In real app, name
      doc.moveDown();
      doc.fontSize(14).text('To:', 300, 150);
      doc.fontSize(10).text(invoice.receiverId); // In real app, name
      doc.moveDown();

      // Items
      doc.moveDown();
      doc.fontSize(14).text('Description', 50, 250);
      doc.text('Amount', 450, 250, { align: 'right' });
      doc.moveTo(50, 265).lineTo(550, 265).stroke();

      let y = 280;
      const items = invoice.items as any[]; // Assuming generic Json type
      if (Array.isArray(items)) {
        items.forEach((item) => {
          doc.fontSize(10).text(item.description, 50, y);
          doc.text(Number(item.total).toFixed(2), 450, y, { align: 'right' });
          y += 20;
        });
      }

      // Total
      doc.moveDown();
      const feePercent =
        (Number(invoice.feeAmount) /
          (Number(invoice.amount) + Number(invoice.feeAmount))) *
        100;
      const grossAmount =
        Number(invoice.amount) +
        Number(invoice.feeAmount) +
        Number(invoice.taxAmount);
      doc
        .fontSize(12)
        .text(`Gross Amount: $${grossAmount.toFixed(2)}`, { align: 'right' });
      doc.text(
        `Platform Fee (${feePercent.toFixed(0)}%): -$${Number(invoice.feeAmount).toFixed(2)}`,
        { align: 'right' },
      );
      if (Number(invoice.taxAmount) > 0) {
        doc.text(`Tax: -$${Number(invoice.taxAmount).toFixed(2)}`, {
          align: 'right',
        });
      }
      doc
        .fontSize(16)
        .text(`Net Amount: $${Number(invoice.amount).toFixed(2)}`, {
          align: 'right',
        });

      doc.end();
    });
  }

  async getPlatformFeePercent(): Promise<number> {
    const adminServiceUrl = this.configService.get<string>(
      'ADMIN_SERVICE_URL',
      'http://admin-service:3009',
    );
    try {
      const { data } = (await firstValueFrom(
        this.httpService.get(
          `${adminServiceUrl}/api/public/configs/PLATFORM_FEE_PERCENT`,
        ),
      )) as any;
      return parseFloat(data.value) || 10;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch PLATFORM_FEE_PERCENT from admin-service, falling back to 10%. Error: ${error.message}`,
      );
      return 10;
    }
  }

  async getPaymentGatewayConfig(provider = 'STRIPE'): Promise<any> {
    const adminServiceUrl = this.configService.get<string>(
      'ADMIN_SERVICE_URL',
      'http://admin-service:3009',
    );
    try {
      const key = `GATEWAY_${provider.toUpperCase()}`;
      const { data } = (await firstValueFrom(
        this.httpService.get(`${adminServiceUrl}/api/public/configs/${key}`),
      )) as any;
      return data.value ? JSON.parse(data.value) : null;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch gateway config for ${provider}: ${error.message}`,
      );
      return null;
    }
  }

  // New method to get earnings stats
  async getEarningsStats(
    userId: string,
    period: 'daily' | 'weekly' | 'monthly',
  ) {
    // Fetch all paid invoices where the user is the receiver (earnings)
    const stats = await this.prisma.invoice.findMany({
      where: { receiverId: userId, status: 'PAID' },
      select: { amount: true, createdAt: true },
    });

    const aggregates = new Map<string, number>();

    stats.forEach((s) => {
      const date = new Date(s.createdAt);
      let periodLabel: string;

      if (period === 'daily') {
        periodLabel = date.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        const week = getISOWeek(date);
        const year = date.getUTCFullYear();
        periodLabel = `${year}-W${String(week).padStart(2, '0')}`;
      } else {
        periodLabel = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      }

      const current = aggregates.get(periodLabel) || 0;
      aggregates.set(periodLabel, current + Number(s.amount));
    });

    const result = Array.from(aggregates.entries()).map(([label, total]) => ({
      period: label,
      totalEarnings: total,
    }));

    // Sort by period
    result.sort((a, b) => a.period.localeCompare(b.period));

    return result;
  }

  // New method to get spending stats (for Clients)
  async getSpendingStats(
    userId: string,
    period: 'daily' | 'weekly' | 'monthly',
  ) {
    // Fetch all paid invoices where the user is the sender (spending)
    const stats = await this.prisma.invoice.findMany({
      where: { senderId: userId, status: 'PAID' },
      select: { amount: true, createdAt: true },
    });

    const aggregates = new Map<string, number>();

    stats.forEach((s) => {
      const date = new Date(s.createdAt);
      let periodLabel: string;

      if (period === 'daily') {
        periodLabel = date.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        const week = getISOWeek(date);
        const year = date.getUTCFullYear();
        periodLabel = `${year}-W${String(week).padStart(2, '0')}`;
      } else {
        periodLabel = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      }

      const current = aggregates.get(periodLabel) || 0;
      aggregates.set(periodLabel, current + Number(s.amount));
    });

    const result = Array.from(aggregates.entries()).map(([label, total]) => ({
      period: label,
      totalSpending: total,
    }));

    // Sort by period
    result.sort((a, b) => a.period.localeCompare(b.period));

    return result;
  }

  async updateAutoWithdrawalSettings(userId: string, data: any) {
    const wallet = await this.getWallet(userId);
    return this.prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        autoWithdrawalEnabled: data.enabled,
        autoWithdrawalThreshold: data.threshold
          ? new Decimal(data.threshold)
          : null,
        autoWithdrawalSchedule: data.schedule,
        autoWithdrawalMethodId: data.methodId,
      },
    });
  }

  async getWithdrawalMethods(userId: string) {
    return this.prisma.withdrawalMethod.findMany({
      where: { userId },
    });
  }

  async addWithdrawalMethod(userId: string, data: any) {
    // If setting as default, unset others
    if (data.isDefault) {
      await this.prisma.withdrawalMethod.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.withdrawalMethod.create({
      data: {
        userId,
        type: data.type,
        provider: data.provider,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        isDefault: data.isDefault,
        isInstantCapable: data.isInstantCapable || false, // Added support
      },
    });
  }

  async deleteWithdrawalMethod(userId: string, id: string) {
    return this.prisma.withdrawalMethod.delete({
      where: { id, userId },
    });
  }

  async setDefaultWithdrawalMethod(userId: string, id: string) {
    await this.prisma.withdrawalMethod.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
    return this.prisma.withdrawalMethod.update({
      where: { id, userId },
      data: { isDefault: true },
    });
  }

  async verifyInstantCapability(userId: string, id: string) {
    // Simulating a 3rd party check for real-time payout capability (e.g., Visa Direct/Mastercard Send)
    return this.prisma.withdrawalMethod.update({
      where: { id, userId },
      data: { isInstantCapable: true },
    });
  }

  async createSubscription(
    userId: string,
    data: { planId: string; price: number },
  ) {
    const wallet = await this.getWallet(userId);
    if (Number(wallet.balance) < data.price) {
      throw new BadRequestException('Insufficient funds in wallet');
    }

    return this.prisma.$transaction(async (prisma) => {
      // 1. Deduct first month
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: data.price } },
      });

      // 2. Create Transaction
      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          amount: data.price,
          type: 'SUBSCRIPTION_FEE',
          status: 'COMPLETED',
          description: `Subscription: ${data.planId}`,
        },
      });

      // 3. Create Subscription Record
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      const sub = await prisma.subscription.create({
        data: {
          userId,
          planId: data.planId,
          price: new Decimal(data.price),
          nextBillingDate,
          status: 'ACTIVE',
        },
      });

      // 4. Notify User Service (Update Tier / Cache)
      try {
        const userServiceUrl = this.configService.get<string>(
          'USER_SERVICE_INTERNAL_URL',
          'http://user-service:3000/api/users',
        );
        await firstValueFrom(
          this.httpService.patch(
            `${userServiceUrl}/${userId}/subscription-status`,
            {
              tier: data.planId,
              status: 'ACTIVE',
              endsAt: nextBillingDate.toISOString(),
            },
          ),
        );
      } catch (error) {
        this.logger.error(
          `Failed to sync subscription status with user-service for user ${userId}: ${error.message}`,
        );
      }

      await this.logFinancialEvent({
        service: 'payment-service',
        eventType: 'SUBSCRIPTION_FEE_PAID',
        actorId: userId,
        amount: data.price,
        referenceId: sub.id,
        metadata: {
          planId: data.planId,
        },
      });

      return sub;
    });
  }

  // Escrow Logic
  async fundEscrow(
    userId: string,
    data: { contractId: string; milestoneId: string; amount: number },
  ) {
    const wallet = await this.getWallet(userId);
    if (Number(wallet.balance) < data.amount) {
      throw new BadRequestException('Insufficient funds to fund escrow');
    }

    return this.prisma.$transaction(async (prisma) => {
      // 1. Deduct from wallet
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: data.amount } },
      });

      // 2. Create Funding Transaction
      const transaction = await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          amount: new Decimal(data.amount),
          type: 'DESCROW_FUND',
          status: 'COMPLETED',
          description: `Escrow Fund for Contract ${data.contractId} Milestone ${data.milestoneId}`,
        },
      });

      // 3. Create Escrow Hold
      const hold = await (prisma as any).escrowHold.create({
        data: {
          walletId: wallet.id,
          transactionId: transaction.id,
          contractId: data.contractId,
          milestoneId: data.milestoneId,
          amount: new Decimal(data.amount),
          status: 'HELD',
        },
      });

      await this.logFinancialEvent({
        service: 'payment-service',
        eventType: 'ESCROW_FUNDED',
        actorId: userId,
        amount: data.amount,
        referenceId: data.milestoneId,
        metadata: {
          contractId: data.contractId,
          holdId: hold.id,
        },
      });

      return hold;
    });
  }

  async releaseEscrow(
    contractId: string,
    milestoneId: string,
    freelancerId: string,
  ) {
    const hold = await (this.prisma as any).escrowHold.findFirst({
      where: { contractId, milestoneId, status: 'HELD' },
    });

    if (!hold) {
      throw new NotFoundException(
        'No active escrow hold found for this milestone',
      );
    }

    // Check if contract is disputed
    const contractUrl = this.configService.get<string>(
      'CONTRACT_SERVICE_URL',
      'http://contract-service:3003',
    );
    try {
      const contractRes = await firstValueFrom(
        this.httpService.get(`${contractUrl}/api/contracts/${contractId}`),
      );
      const contract = contractRes.data;
      if (contract.status === 'DISPUTED') {
        throw new BadRequestException(
          'Cannot release escrow while contract is in DISPUTED status. Please resolve arbitration first.',
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Failed to verify contract status: ${error.message}`);
      // If contract service is down, we might want to fail safe or proceed.
      // Safe option: block release.
      throw new BadRequestException(
        'Could not verify contract status. Try again later.',
      );
    }

    const freelancerWallet = await this.getWallet(freelancerId);

    return this.prisma.$transaction(async (prisma) => {
      // 1. Credit Freelancer
      await prisma.wallet.update({
        where: { id: freelancerWallet.id },
        data: { balance: { increment: hold.amount } },
      });

      // 2. Update Hold Status
      await (prisma as any).escrowHold.update({
        where: { id: hold.id },
        data: { status: 'RELEASED' },
      });

      // 3. Create Release Transaction
      const tx = await prisma.transaction.create({
        data: {
          walletId: freelancerWallet.id,
          amount: hold.amount,
          type: 'ESCROW_RELEASE',
          status: 'COMPLETED',
          description: `Escrow Release for Contract ${contractId} Milestone ${milestoneId}`,
        },
      });

      await this.logFinancialEvent({
        service: 'payment-service',
        eventType: 'ESCROW_RELEASED',
        actorId: freelancerId,
        amount: Number(hold.amount),
        referenceId: milestoneId,
        metadata: {
          contractId,
          holdId: hold.id,
          transactionId: tx.id,
        },
      });

      return tx;
    });
  }

  async refundEscrow(contractId: string, milestoneId: string) {
    const hold = await (this.prisma as any).escrowHold.findFirst({
      where: { contractId, milestoneId, status: 'HELD' },
    });

    if (!hold) {
      throw new NotFoundException(
        'No active escrow hold found for this milestone',
      );
    }

    return this.prisma.$transaction(async (prisma) => {
      // 1. Credit Client wallet (the hold.walletId is the client's wallet)
      await prisma.wallet.update({
        where: { id: hold.walletId },
        data: { balance: { increment: hold.amount } },
      });

      // 2. Update Hold Status
      await (prisma as any).escrowHold.update({
        where: { id: hold.id },
        data: { status: 'REFUNDED' },
      });

      // 3. Create Refund Transaction
      const tx = await prisma.transaction.create({
        data: {
          walletId: hold.walletId,
          amount: hold.amount,
          type: 'ESCROW_REFUND',
          status: 'COMPLETED',
          description: `Escrow Refund for Contract ${contractId} Milestone ${milestoneId}`,
        },
      });

      await this.logFinancialEvent({
        service: 'payment-service',
        eventType: 'ESCROW_REFUNDED',
        actorId: hold.walletId,
        amount: Number(hold.amount),
        referenceId: milestoneId,
        metadata: {
          contractId,
          holdId: hold.id,
          transactionId: tx.id,
        },
      });

      return tx;
    });
  }

  // EOR Payroll
  async processPayroll(
    contractId: string,
    data: {
      periodStart: Date;
      periodEnd: Date;
      grossAmount: number;
      employeeId: string;
    },
  ) {
    const contractUrl = this.configService.get<string>(
      'CONTRACT_SERVICE_URL',
      'http://contract-service:3003',
    );
    const contractRes = await firstValueFrom(
      this.httpService.get(`${contractUrl}/api/contracts/${contractId}`),
    );
    const contract = contractRes.data;
    if (contract.type !== 'EOR')
      throw new BadRequestException('Not an EOR contract');

    const gross = new Decimal(data.grossAmount);
    const eorFee = gross.mul(contract.eorFeePercentage || 5.0).div(100);
    const taxRate = 0.2; // 20% Mock Tax
    const benefitsCost = 150.0; // Mock Benefits
    const taxAmount = gross.mul(taxRate);
    const netAmount = gross.sub(taxAmount).sub(benefitsCost);

    const clientWallet = await this.getWallet(contract.client_id);

    return this.prisma.$transaction(async (prisma) => {
      // 1. Charge Client (Gross + Fee)
      const totalCharge = gross.add(eorFee);
      await prisma.wallet.update({
        where: { id: clientWallet.id },
        data: { balance: { decrement: totalCharge } },
      });

      await prisma.transaction.create({
        data: {
          walletId: clientWallet.id,
          amount: totalCharge,
          type: 'PAYROLL_CHARGE',
          status: 'COMPLETED',
          description: `Payroll for ${data.periodStart} - ${data.periodEnd} (Incl. Fees)`,
        },
      });

      // 2. Pay Employee (Net)
      const employeeWallet = await this.getWallet(data.employeeId);
      await prisma.wallet.update({
        where: { id: employeeWallet.id },
        data: { balance: { increment: netAmount } },
      });

      await prisma.transaction.create({
        data: {
          walletId: employeeWallet.id,
          amount: netAmount,
          type: 'PAYROLL_RECEIPT',
          status: 'COMPLETED',
          description: `Salary Payment (Net after Tax/Benefits)`,
        },
      });

      // 3. Record Payroll
      return (prisma as any).payroll.create({
        data: {
          contractId,
          employeeId: data.employeeId,
          periodStart: data.periodStart,
          periodEnd: data.periodEnd,
          grossAmount: gross,
          taxAmount,
          benefitsAmount: benefitsCost,
          netAmount,
          status: 'PAID',
        },
      });
    });
  }

  // Payment Methods (Client)
  async addPaymentMethod(userId: string, data: any) {
    if (data.isDefault) {
      await this.prisma.paymentMethod.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.paymentMethod.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async getPaymentMethods(userId: string) {
    return this.prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deletePaymentMethod(userId: string, id: string) {
    return this.prisma.paymentMethod.delete({
      where: { id, userId },
    });
  }

  // Auto-deposit Logic
  async updateAutoDepositConfig(
    userId: string,
    data: {
      enabled: boolean;
      threshold?: number;
      amount?: number;
      paymentMethodId?: string;
    },
  ) {
    const wallet = await this.getWallet(userId);
    const updated = await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        autoDepositEnabled: data.enabled,
        autoDepositThreshold: data.threshold
          ? new Decimal(data.threshold)
          : null,
        autoDepositAmount: data.amount ? new Decimal(data.amount) : null,
        paymentMethodId: data.paymentMethodId,
      },
    });

    if (updated.autoDepositEnabled) {
      await this.checkAndTriggerAutoDeposit(userId);
    }

    return updated;
  }

  async checkAndTriggerAutoDeposit(userId: string) {
    const wallet = await this.getWallet(userId);

    if (
      wallet.autoDepositEnabled &&
      wallet.autoDepositThreshold &&
      wallet.autoDepositAmount &&
      wallet.balance.lessThan(wallet.autoDepositThreshold)
    ) {
      this.logger.log(
        `Triggering auto-deposit for user ${userId}. Balance: ${wallet.balance}, Threshold: ${wallet.autoDepositThreshold}`,
      );

      // In a real app, charge the payment method here.
      // For MVP, we simulate a successful charge and deposit.

      const referenceId = `AUTO-DEP-${Date.now()}`;
      await this.deposit(userId, Number(wallet.autoDepositAmount), referenceId);

      this.logger.log(
        `Auto-deposit of ${wallet.autoDepositAmount} successful for user ${userId}`,
      );
    }
  }

  // Tax Documents (1099-K Preview)
  async getTaxYearSummary(userId: string, year: number) {
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    // Fetch COMPLETED, PAID invoices where receiverId is the user
    const invoices = await this.prisma.invoice.findMany({
      where: {
        receiverId: userId,
        status: 'PAID',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const grossVolume = invoices.reduce(
      (sum, inv) =>
        sum +
        Number(inv.amount) +
        Number(inv.feeAmount) +
        Number(inv.taxAmount),
      0,
    );
    const feesPaid = invoices.reduce(
      (sum, inv) => sum + Number(inv.feeAmount),
      0,
    );
    const taxWithheld = invoices.reduce(
      (sum, inv) => sum + Number(inv.taxAmount),
      0,
    );
    const netVolume = invoices.reduce(
      (sum, inv) => sum + Number(inv.amount),
      0,
    );

    return {
      userId,
      year,
      grossVolume,
      feesPaid,
      taxWithheld,
      netVolume,
      transactionCount: invoices.length,
      generatedAt: new Date(),
    };
  }

  async generateTaxDocumentPdf(userId: string, year: number): Promise<Buffer> {
    const summary = await this.getTaxYearSummary(userId, year);
    if (summary.transactionCount === 0) {
      throw new NotFoundException(`No transactions found for tax year ${year}`);
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .text('TAX YEAR SUMMARY (1099-K Preview)', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Tax Year: ${year}`, { align: 'center' });
      doc.moveDown();
      doc
        .fontSize(12)
        .text(`Generated Date: ${summary.generatedAt.toDateString()}`, {
          align: 'center',
        });
      doc.moveDown();

      // User Info
      doc.fontSize(12).text(`Account ID: ${userId}`);
      doc.moveDown();
      doc.moveTo(50, 200).lineTo(550, 200).stroke();
      doc.moveDown();

      // Summary Table
      const startX = 50;
      let currentY = 220;

      doc.fontSize(12).text('Metric', startX, currentY);
      doc.text('Amount (USD)', 400, currentY, { align: 'right' });
      currentY += 20;

      // Gross
      doc.text('Gross Payment Volume', startX, currentY);
      doc.text(`$${summary.grossVolume.toFixed(2)}`, 400, currentY, {
        align: 'right',
      });
      currentY += 20;

      // Fees
      doc.text('Platform Fees & Adjustments', startX, currentY);
      doc.text(`-$${summary.feesPaid.toFixed(2)}`, 400, currentY, {
        align: 'right',
      });
      currentY += 20;

      // Tax
      doc.text('Tax Withheld', startX, currentY);
      doc.text(`-$${summary.taxWithheld.toFixed(2)}`, 400, currentY, {
        align: 'right',
      });
      currentY += 20;

      doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
      currentY += 10;

      // Net
      doc.font('Helvetica-Bold').text('Net Income', startX, currentY);
      doc.text(`$${summary.netVolume.toFixed(2)}`, 400, currentY, {
        align: 'right',
      });
      currentY += 40;

      doc
        .font('Helvetica')
        .fontSize(10)
        .text(
          'Note: This document is a preview for informational purposes only and is not an official IRS form 1099-K. Please consult a tax professional.',
          50,
          currentY,
          { width: 500, align: 'center' },
        );

      doc.end();
    });
  }

  async processChargeback(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { wallet: true },
    });

    if (!transaction) throw new NotFoundException('Transaction not found');

    if (transaction.status === 'CHARGEBACK') {
      throw new BadRequestException('Transaction already charged back');
    }

    if (transaction.type !== 'PAYMENT') {
      throw new BadRequestException('Only payments can be charged back');
    }

    return this.prisma.$transaction(async (prisma) => {
      const updatedTx = await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'CHARGEBACK',
          description: `${transaction.description} [CHARGEBACK]`,
        },
      });

      await prisma.wallet.update({
        where: { id: transaction.walletId },
        data: { balance: { decrement: transaction.amount } },
      });

      await this.logFinancialEvent({
        service: 'payment-service',
        eventType: 'CHARGEBACK_PROCESSED',
        actorId: transaction.wallet.userId,
        amount: Number(transaction.amount),
        referenceId: transaction.referenceId || undefined,
        metadata: { transactionId },
      });

      return updatedTx;
    });
  }

  private async logFinancialEvent(data: {
    service: string;
    eventType: string;
    actorId?: string;
    amount?: number;
    metadata?: any;
    referenceId?: string;
  }) {
    const auditServiceUrl = this.configService.get<string>(
      'AUDIT_SERVICE_URL',
      'http://audit-service:3011',
    );
    const auditSecret = this.configService.get<string>('AUDIT_SECRET', 'fallback-secret');
    try {
      await firstValueFrom(
        this.httpService.post(`${auditServiceUrl}/api/audit/logs`, data, {
          headers: { 'x-audit-secret': auditSecret }
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to log financial event to audit-service: ${error.message}`,
      );
    }
  }

  // Tax & VAT Management
  async createTaxSetting(data: {
    countryCode: string;
    taxRate: number;
    name: string;
  }) {
    return this.prisma.taxSetting.create({
      data: {
        ...data,
        taxRate: new Decimal(data.taxRate),
      },
    });
  }

  async getTaxSettings() {
    return this.prisma.taxSetting.findMany({
      orderBy: { countryCode: 'asc' },
    });
  }

  async updateTaxSetting(
    id: string,
    data: { taxRate?: number; isActive?: boolean },
  ) {
    return this.prisma.taxSetting.update({
      where: { id },
      data: {
        ...(data.taxRate && { taxRate: new Decimal(data.taxRate) }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async getPredictiveRevenue(userId: string) {
    const now = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(now.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    // 1. Fetch historical earnings (last 12 months)
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    const historicalTxs = wallet
      ? await this.prisma.transaction.findMany({
        where: {
          walletId: wallet.id,
          type: 'PAYMENT',
          status: { in: ['COMPLETED', 'PENDING'] },
          createdAt: { gte: twelveMonthsAgo },
        },
        orderBy: { createdAt: 'asc' },
      })
      : [];

    const historicalData: Record<string, number> = {};
    for (let i = 0; i < 12; i++) {
      const d = new Date();
      d.setMonth(now.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      historicalData[key] = 0;
    }

    historicalTxs.forEach((tx) => {
      const d = new Date(tx.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (historicalData[key] !== undefined) {
        historicalData[key] += Number(tx.amount);
      }
    });

    // 2. Fetch contracts and milestones from contract-service
    let contracts: any[] = [];
    try {
      const contractServiceUrl = this.configService.get<string>(
        'CONTRACT_SERVICE_URL',
        'http://contract-service:3000',
      );
      const response: any = await firstValueFrom(
        this.httpService.get(
          `${contractServiceUrl}/api/contracts/internal/freelancer/${userId}`,
        ),
      );
      contracts = response.data;
    } catch (err) {
      this.logger.error(
        `Failed to fetch contracts for predictive revenue: ${err.message}`,
      );
    }

    let pendingRevenue = 0;
    const projections: Record<string, number> = {};
    for (let i = 0; i < 4; i++) {
      const d = new Date();
      d.setMonth(now.getMonth() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      projections[key] = 0;
    }

    contracts.forEach((contract) => {
      if (contract.status === 'ACTIVE' || contract.status === 'DISPUTED') {
        contract.milestones?.forEach((m: any) => {
          if (m.status === 'IN_REVIEW') {
            pendingRevenue += Number(m.amount);
          } else if (m.status === 'PENDING' || m.status === 'ACTIVE') {
            const dueDate = m.dueDate ? new Date(m.dueDate) : null;
            if (dueDate && dueDate >= now) {
              const key = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`;
              if (projections[key] !== undefined) {
                projections[key] += Number(m.amount);
              }
            }
          }
        });

        // Simple hourly projection based on timeLogs if available
        // Note: For now, we assume current active contracts continue at their current pace.
        // In a real scenario, we'd average the last 4 weeks of TimeLogs.
      }
    });

    return {
      userId,
      currentStats: {
        totalEarned: historicalTxs.reduce(
          (sum, tx) => sum + Number(tx.amount),
          0,
        ),
        pendingRevenue, // Money in review
        availableBalance: Number(wallet?.balance || 0),
      },
      historicalTrend: Object.entries(historicalData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, amount]) => ({ month, amount })),
      projections: Object.entries(projections)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, amount]) => ({ month, amount })),
    };
  }
  async processRecipientCredit(
    prisma: any,
    fromUserId: string,
    toUserId: string,
    grossAmount: number,
    feeAmount: number,
    netAmount: number,
    description: string,
    referenceId?: string,
  ) {
    const toWallet = await this.getWallet(toUserId);
    const clearingDate = new Date();
    clearingDate.setDate(clearingDate.getDate() + 5); // 5-day clearing period

    await prisma.wallet.update({
      where: { id: toWallet.id },
      data: { pendingBalance: { increment: netAmount } } as any,
    });

    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        senderId: fromUserId,
        receiverId: toUserId,
        amount: new Decimal(netAmount),
        feeAmount: new Decimal(feeAmount),
        status: 'PAID',
        paidAt: new Date(),
        items: [
          {
            description,
            quantity: 1,
            unitPrice: grossAmount,
            grossAmount: grossAmount,
            feeAmount: feeAmount,
            netAmount: netAmount,
          },
        ],
      },
    });

    await prisma.transaction.create({
      data: {
        walletId: toWallet.id,
        amount: netAmount,
        feeAmount: feeAmount,
        type: 'PAYMENT',
        status: 'PENDING',
        clearedAt: clearingDate,
        description: `Payment from ${fromUserId}: ${description}`,
        referenceId,
        invoiceId: invoice.id,
      } as any,
    });

    return invoice;
  }

  async checkApproval(teamId: string, triggerType: string, amount: number) {
    try {
      const userServiceUrl = this.configService.get<string>(
        'USER_SERVICE_URL',
        'http://user-service:3001',
      );
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${userServiceUrl}/api/user/teams/${teamId}/policies/check`,
          {
            params: { type: triggerType, amount },
          },
        ),
      );
      return data;
    } catch (error) {
      this.logger.error(`Failed to check approval policy: ${error.message}`);
      return { required: false };
    }
  }

  async approvePayment(transactionId: string, userId: string) {
    const tx = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { approvalParams: true, wallet: true },
    });

    if (!tx) throw new NotFoundException('Transaction not found');
    if (tx.status !== 'PENDING_APPROVAL')
      throw new ConflictException('Transaction not pending approval');

    return this.prisma.$transaction(async (prisma) => {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: 'COMPLETED' },
      });

      if (tx.approvalParams) {
        await prisma.paymentApprovalRequest.update({
          where: { id: tx.approvalParams.id },
          data: {
            status: 'APPROVED',
            decidedBy: userId,
            decidedAt: new Date(),
          },
        });
      }

      const feeRatePercent = await this.getPlatformFeePercent();
      const amount = Number(tx.amount);
      const feeRate = feeRatePercent / 100;
      const feeAmount = amount * feeRate;
      const netAmount = amount - feeAmount;

      const match = tx.description?.match(/Payment to ([^:]+):/);
      if (!match)
        throw new Error(
          'Could not determine recipient from transaction description',
        );
      const toUserId = match[1];
      const description = tx.description?.split(': ')[1] || 'Payment';

      const invoice = await this.processRecipientCredit(
        prisma,
        tx.wallet.userId,
        toUserId,
        amount,
        feeAmount,
        netAmount,
        description,
        tx.referenceId || undefined,
      );

      await this.logFinancialEvent({
        service: 'payment-service',
        eventType: 'PAYMENT_APPROVED',
        actorId: userId,
        amount: amount,
        referenceId: tx.referenceId || undefined,
        metadata: {
          approvedBy: userId,
          transactionId,
        },
      });

      // Log to Analytics Service for Dashboarding
      await this.logToAnalytics({
        userId: toUserId, // Freelancer
        counterpartyId: tx.wallet.userId, // Client
        amount: Number(netAmount),
        currency: 'USD',
        category: 'Earnings',
        jobId: tx.referenceId || '', // Assuming referenceId links to job/contract
        transactionId: transactionId,
      });

      return { success: true, status: 'APPROVED', invoiceId: invoice.id };
    });
  }
  async getDepartmentSpend(departmentId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { departmentId },
      select: { amount: true },
    });

    const totalSpend = transactions.reduce(
      (acc, tx) => acc + Number(tx.amount),
      0,
    );
    return { departmentId, totalSpend: new Decimal(totalSpend) };
  }

  private async logToAnalytics(data: {
    userId: string;
    counterpartyId: string;
    amount: number;
    currency: string;
    category: string;
    jobId: string;
    transactionId: string;
  }) {
    const analyticsUrl = this.configService.get<string>(
      'ANALYTICS_SERVICE_URL',
      'http://analytics-service:8000',
    );
    try {
      await firstValueFrom(
        this.httpService.post(`${analyticsUrl}/api/analytics/financials`, data),
      );
    } catch (error) {
      this.logger.error(
        `Failed to log financial event to analytics-service: ${error.message}`,
      );
    }
  }
}
