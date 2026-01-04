import {
  Injectable,
  NotFoundException,
  BadRequestException,
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

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) { }

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
        this.logger.warn('No Payment Gateway configuration found. Deposits might fail in production.');
      }

      return updatedWallet;
    });
  }

  async withdraw(userId: string, amount: number) {
    const wallet = await this.getWallet(userId);
    if (!wallet) throw new NotFoundException('Wallet not found');

    if (Number(wallet.balance) < amount) {
      throw new BadRequestException('Insufficient funds');
    }

    return this.prisma.$transaction(async (prisma) => {
      const updatedWallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } },
      });

      await prisma.transaction.create({
        data: {
          walletId: wallet.id,
          amount: amount,
          type: 'WITHDRAWAL',
          status: 'COMPLETED', // In real app, might be PENDING
          description: 'Withdrawal to Bank Account',
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

      await prisma.transaction.create({
        data: {
          walletId: fromWallet.id,
          amount: amount,
          type: 'PAYMENT',
          status: 'COMPLETED',
          description: `Payment to ${toUserId}: ${description}`,
          referenceId,
        },
      });

      // PENDING Transaction for Recipient (Freelancer) - Receive NET amount
      const clearingDate = new Date();
      clearingDate.setDate(clearingDate.getDate() + 5); // 5-day clearing period

      await prisma.wallet.update({
        where: { id: toWallet.id },
        data: { pendingBalance: { increment: netAmount } } as any,
      });

      // Create Invoice with breakdown
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
              unitPrice: amount,
              grossAmount: amount,
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
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${adminServiceUrl}/api/public/configs/PLATFORM_FEE_PERCENT`,
        ),
      );
      return parseFloat(data.value) || 10;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch PLATFORM_FEE_PERCENT from admin-service, falling back to 10%. Error: ${error.message}`,
      );
      return 10;
    }
  }

  async getPaymentGatewayConfig(provider = 'STRIPE'): Promise<any> {
    const adminServiceUrl = this.configService.get<string>('ADMIN_SERVICE_URL', 'http://admin-service:3009');
    try {
      const key = `GATEWAY_${provider.toUpperCase()}`;
      const { data } = await firstValueFrom(
        this.httpService.get(`${adminServiceUrl}/api/public/configs/${key}`)
      );
      return data.value ? JSON.parse(data.value) : null;
    } catch (error) {
      this.logger.warn(`Failed to fetch gateway config for ${provider}: ${error.message}`);
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
        ...data,
        userId,
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
    data: { enabled: boolean; threshold?: number; amount?: number; paymentMethodId?: string }
  ) {
    const wallet = await this.getWallet(userId);
    const updated = await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        autoDepositEnabled: data.enabled,
        autoDepositThreshold: data.threshold ? new Decimal(data.threshold) : null,
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
      this.logger.log(`Triggering auto-deposit for user ${userId}. Balance: ${wallet.balance}, Threshold: ${wallet.autoDepositThreshold}`);

      // In a real app, charge the payment method here.
      // For MVP, we simulate a successful charge and deposit.

      const referenceId = `AUTO-DEP-${Date.now()}`;
      await this.deposit(userId, Number(wallet.autoDepositAmount), referenceId);

      this.logger.log(`Auto-deposit of ${wallet.autoDepositAmount} successful for user ${userId}`);
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

    const grossVolume = invoices.reduce((sum, inv) => sum + Number(inv.amount) + Number(inv.feeAmount) + Number(inv.taxAmount), 0);
    const feesPaid = invoices.reduce((sum, inv) => sum + Number(inv.feeAmount), 0);
    const taxWithheld = invoices.reduce((sum, inv) => sum + Number(inv.taxAmount), 0);
    const netVolume = invoices.reduce((sum, inv) => sum + Number(inv.amount), 0);

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
      doc.fontSize(20).text('TAX YEAR SUMMARY (1099-K Preview)', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Tax Year: ${year}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Generated Date: ${summary.generatedAt.toDateString()}`, { align: 'center' });
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
      doc.text(`$${summary.grossVolume.toFixed(2)}`, 400, currentY, { align: 'right' });
      currentY += 20;

      // Fees
      doc.text('Platform Fees & Adjustments', startX, currentY);
      doc.text(`-$${summary.feesPaid.toFixed(2)}`, 400, currentY, { align: 'right' });
      currentY += 20;

      // Tax
      doc.text('Tax Withheld', startX, currentY);
      doc.text(`-$${summary.taxWithheld.toFixed(2)}`, 400, currentY, { align: 'right' });
      currentY += 20;

      doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
      currentY += 10;

      // Net
      doc.font('Helvetica-Bold').text('Net Income', startX, currentY);
      doc.text(`$${summary.netVolume.toFixed(2)}`, 400, currentY, { align: 'right' });
      currentY += 40;

      doc.font('Helvetica').fontSize(10).text(
        'Note: This document is a preview for informational purposes only and is not an official IRS form 1099-K. Please consult a tax professional.',
        50, currentY, { width: 500, align: 'center' }
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
        data: { status: 'CHARGEBACK', description: `${transaction.description} [CHARGEBACK]` }
      });

      await prisma.wallet.update({
        where: { id: transaction.walletId },
        data: { balance: { decrement: transaction.amount } }
      });

      await prisma.transaction.create({
        data: {
          walletId: transaction.walletId,
          amount: transaction.amount,
          type: 'CHARGEBACK',
          status: 'COMPLETED',
          description: `Chargeback for ${transactionId}`,
          referenceId: transaction.referenceId
        }
      });

      return updatedTx;
    });
  }

  // Tax & VAT Management
  async createTaxSetting(data: { countryCode: string; taxRate: number; name: string }) {
    return this.prisma.taxSetting.create({
      data: {
        ...data,
        taxRate: new Decimal(data.taxRate),
      },
    });
  }

  async getTaxSettings() {
    return this.prisma.taxSetting.findMany({
      orderBy: { countryCode: 'asc' }
    });
  }

  async updateTaxSetting(id: string, data: { taxRate?: number; isActive?: boolean }) {
    return this.prisma.taxSetting.update({
      where: { id },
      data: {
        ...(data.taxRate && { taxRate: new Decimal(data.taxRate) }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }
}
