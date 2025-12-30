"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createWallet(userId) {
        return this.prisma.wallet.create({
            data: { userId },
        });
    }
    async getWallet(userId) {
        let wallet = await this.prisma.wallet.findUnique({
            where: { userId },
            include: { transactions: { orderBy: { createdAt: 'desc' } } },
        });
        if (!wallet) {
            return this.createWallet(userId);
        }
        const now = new Date();
        const pendingCleared = wallet.transactions.filter((tx) => tx.status === 'PENDING' && tx.clearedAt && new Date(tx.clearedAt) <= now);
        if (pendingCleared.length > 0) {
            const walletId = wallet.id;
            await this.prisma.$transaction(async (prisma) => {
                for (const tx of pendingCleared) {
                    await prisma.wallet.update({
                        where: { id: walletId },
                        data: {
                            pendingBalance: { decrement: tx.amount },
                            balance: { increment: tx.amount },
                        },
                    });
                    await prisma.transaction.update({
                        where: { id: tx.id },
                        data: { status: 'COMPLETED' },
                    });
                }
            });
            const updatedWallet = await this.prisma.wallet.findUnique({
                where: { userId },
                include: { transactions: { orderBy: { createdAt: 'desc' } } },
            });
            return updatedWallet;
        }
        return wallet;
    }
    async deposit(userId, amount, referenceId) {
        const wallet = await this.getWallet(userId);
        if (!wallet)
            throw new common_1.NotFoundException('Wallet not found');
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
    async withdraw(userId, amount) {
        const wallet = await this.getWallet(userId);
        if (!wallet)
            throw new common_1.NotFoundException('Wallet not found');
        if (Number(wallet.balance) < amount) {
            throw new common_1.BadRequestException('Insufficient funds');
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
                    status: 'COMPLETED',
                    description: 'Withdrawal to Bank Account',
                },
            });
            return updatedWallet;
        });
    }
    async addWithdrawalMethod(userId, data) {
        return this.prisma.withdrawalMethod.create({
            data: { ...data, userId },
        });
    }
    async getWithdrawalMethods(userId) {
        return this.prisma.withdrawalMethod.findMany({
            where: { userId },
            orderBy: { isDefault: 'desc' },
        });
    }
    async deleteWithdrawalMethod(userId, id) {
        return this.prisma.withdrawalMethod.deleteMany({
            where: { id, userId },
        });
    }
    async setDefaultWithdrawalMethod(userId, id) {
        await this.prisma.withdrawalMethod.updateMany({
            where: { userId },
            data: { isDefault: false },
        });
        return this.prisma.withdrawalMethod.update({
            where: { id },
            data: { isDefault: true },
        });
    }
    async getInvoiceData(transactionId) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { wallet: true },
        });
        if (!transaction)
            throw new common_1.NotFoundException('Transaction not found');
        if (!transaction.wallet)
            throw new common_1.NotFoundException('Wallet for transaction not found');
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
    async transfer(fromUserId, toUserId, amount, description, referenceId) {
        const fromWallet = await this.getWallet(fromUserId);
        const toWallet = await this.getWallet(toUserId);
        if (!fromWallet || !toWallet) {
            throw new common_1.NotFoundException('Wallet not found for user');
        }
        if (Number(fromWallet.balance) < amount) {
            throw new common_1.BadRequestException('Insufficient funds in source wallet');
        }
        return this.prisma.$transaction(async (prisma) => {
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
            const clearingDate = new Date();
            clearingDate.setDate(clearingDate.getDate() + 5);
            await prisma.wallet.update({
                where: { id: toWallet.id },
                data: { pendingBalance: { increment: amount } },
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
                },
            });
            return { success: true };
        });
    }
    async getTransactionsByReference(referenceId) {
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map