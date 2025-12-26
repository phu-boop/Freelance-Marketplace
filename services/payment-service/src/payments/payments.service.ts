import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) { }

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
    return wallet;
  }

  async deposit(userId: string, amount: number, referenceId: string) {
    const wallet = await this.getWallet(userId);

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

      return updatedWallet;
    });
  }

  async withdraw(userId: string, amount: number) {
    const wallet = await this.getWallet(userId);

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

  // Withdrawal Methods
  async addWithdrawalMethod(userId: string, data: any) {
    return this.prisma.withdrawalMethod.create({
      data: { ...data, userId },
    });
  }

  async getWithdrawalMethods(userId: string) {
    return this.prisma.withdrawalMethod.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async deleteWithdrawalMethod(userId: string, id: string) {
    return this.prisma.withdrawalMethod.deleteMany({
      where: { id, userId },
    });
  }

  async setDefaultWithdrawalMethod(userId: string, id: string) {
    await this.prisma.withdrawalMethod.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
    return this.prisma.withdrawalMethod.update({
      where: { id },
      data: { isDefault: true },
    });
  }

  async getInvoiceData(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { wallet: true },
    });

    if (!transaction) throw new NotFoundException('Transaction not found');

    return {
      invoiceNumber: `INV-${transaction.id.slice(0, 8).toUpperCase()}`,
      date: transaction.createdAt,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      status: transaction.status,
      userId: transaction.wallet.userId,
    };
  }

  async transfer(fromUserId: string, toUserId: string, amount: number, description: string) {
    const fromWallet = await this.getWallet(fromUserId);
    const toWallet = await this.getWallet(toUserId);

    if (Number(fromWallet.balance) < amount) {
      throw new BadRequestException('Insufficient funds in source wallet');
    }

    return this.prisma.$transaction(async (prisma) => {
      // Deduct from source
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
        },
      });

      // Add to destination
      await prisma.wallet.update({
        where: { id: toWallet.id },
        data: { balance: { increment: amount } },
      });

      await prisma.transaction.create({
        data: {
          walletId: toWallet.id,
          amount: amount,
          type: 'PAYMENT',
          status: 'COMPLETED',
          description: `Payment from ${fromUserId}: ${description}`,
        },
      });

      return { success: true };
    });
  }

  async getMetrics() {
    const transactions = await this.prisma.transaction.findMany({
      where: { status: 'COMPLETED' },
    });

    const totalVolume = transactions.reduce((acc, tx) => acc + Number(tx.amount), 0);
    const totalPayments = transactions.filter(tx => tx.type === 'PAYMENT').length;
    const totalWithdrawals = transactions.filter(tx => tx.type === 'WITHDRAWAL').length;

    return {
      totalVolume,
      totalPayments,
      totalWithdrawals,
      transactionCount: transactions.length,
    };
  }
}
