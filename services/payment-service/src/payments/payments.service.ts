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
    let wallet = await this.prisma.wallet.findUnique({
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
      (tx: any) => tx.status === 'PENDING' && tx.clearedAt && new Date(tx.clearedAt) <= now
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
    if (!transaction.wallet) throw new NotFoundException('Wallet for transaction not found');

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

  async transfer(fromUserId: string, toUserId: string, amount: number, description: string, referenceId?: string) {
    const fromWallet = await this.getWallet(fromUserId);
    const toWallet = await this.getWallet(toUserId);

    if (!fromWallet || !toWallet) {
      throw new NotFoundException('Wallet not found for user');
    }

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
          referenceId,
        },
      });

      // Add to destination (PENDING)
      const clearingDate = new Date();
      clearingDate.setDate(clearingDate.getDate() + 5); // 5-day clearing period

      await prisma.wallet.update({
        where: { id: toWallet.id },
        data: { pendingBalance: { increment: amount } } as any,
      });

      await prisma.transaction.create({
        data: {
          walletId: toWallet.id,
          amount: amount,
          type: 'PAYMENT',
          status: 'PENDING',
          clearedAt: clearingDate,
          description: `Payment from ${fromUserId}: ${description}`,
          referenceId,
        } as any,
      });

      return { success: true };
    });
  }

  async getTransactionsByReference(referenceId: string) {
    return this.prisma.transaction.findMany({
      where: { referenceId },
      orderBy: { createdAt: 'desc' }
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
