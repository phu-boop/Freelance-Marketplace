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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PaymentsService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
var Decimal = client_1.Prisma.Decimal;
const pdfkit_1 = __importDefault(require("pdfkit"));
const date_fns_1 = require("date-fns");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    prisma;
    httpService;
    configService;
    logger = new common_1.Logger(PaymentsService_1.name);
    constructor(prisma, httpService, configService) {
        this.prisma = prisma;
        this.httpService = httpService;
        this.configService = configService;
    }
    async createWallet(userId) {
        return this.prisma.wallet.create({
            data: { userId },
        });
    }
    async getWallet(userId) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
            include: { transactions: { orderBy: { createdAt: 'desc' } } },
        });
        if (!wallet) {
            return this.createWallet(userId);
        }
        const now = new Date();
        const pendingCleared = wallet.transactions.filter((tx) => tx.status === 'PENDING' &&
            tx.clearedAt &&
            new Date(tx.clearedAt) <= now);
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
    async getInvoiceData(transactionId) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id: transactionId },
            include: {
                wallet: true,
                invoice: true,
            },
        });
        if (!transaction)
            throw new common_1.NotFoundException('Transaction not found');
        if (!transaction.wallet)
            throw new common_1.NotFoundException('Wallet for transaction not found');
        return {
            invoiceNumber: transaction.invoice?.invoiceNumber ||
                `INV-${transaction.id.slice(0, 8).toUpperCase()}`,
            date: transaction.createdAt,
            amount: transaction.amount,
            feeAmount: transaction.feeAmount,
            taxAmount: transaction.taxAmount,
            totalAmount: Number(transaction.amount) +
                Number(transaction.feeAmount) +
                Number(transaction.taxAmount),
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
        const feeRatePercent = await this.getPlatformFeePercent();
        const feeRate = feeRatePercent / 100;
        const feeAmount = amount * feeRate;
        const netAmount = amount - feeAmount;
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
                data: { pendingBalance: { increment: netAmount } },
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
                },
            });
            return { success: true, invoiceId: invoice.id };
        });
    }
    async getTransactionsByReference(referenceId) {
        return this.prisma.transaction.findMany({
            where: { referenceId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getMetrics() {
        const transactions = await this.prisma.transaction.findMany({
            where: { status: 'COMPLETED' },
        });
        const totalVolume = transactions.reduce((acc, tx) => acc + Number(tx.amount), 0);
        const totalPayments = transactions.filter((tx) => tx.type === 'PAYMENT').length;
        const totalWithdrawals = transactions.filter((tx) => tx.type === 'WITHDRAWAL').length;
        return {
            totalVolume,
            totalPayments,
            totalWithdrawals,
            transactionCount: transactions.length,
        };
    }
    async getInvoices(userId) {
        return this.prisma.invoice.findMany({
            where: {
                OR: [{ senderId: userId }, { receiverId: userId }],
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async generateInvoicePdf(invoiceId) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
        });
        if (!invoice)
            throw new common_1.NotFoundException('Invoice not found');
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default();
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);
            doc.fontSize(25).text('INVOICE', 50, 50);
            doc
                .fontSize(12)
                .text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'right' });
            doc.text(`Date: ${invoice.createdAt.toDateString()}`, { align: 'right' });
            doc.moveDown();
            doc.fontSize(14).text('From:', 50, 150);
            doc.fontSize(10).text(invoice.senderId);
            doc.moveDown();
            doc.fontSize(14).text('To:', 300, 150);
            doc.fontSize(10).text(invoice.receiverId);
            doc.moveDown();
            doc.moveDown();
            doc.fontSize(14).text('Description', 50, 250);
            doc.text('Amount', 450, 250, { align: 'right' });
            doc.moveTo(50, 265).lineTo(550, 265).stroke();
            let y = 280;
            const items = invoice.items;
            if (Array.isArray(items)) {
                items.forEach((item) => {
                    doc.fontSize(10).text(item.description, 50, y);
                    doc.text(Number(item.total).toFixed(2), 450, y, { align: 'right' });
                    y += 20;
                });
            }
            doc.moveDown();
            const feePercent = (Number(invoice.feeAmount) /
                (Number(invoice.amount) + Number(invoice.feeAmount))) *
                100;
            const grossAmount = Number(invoice.amount) +
                Number(invoice.feeAmount) +
                Number(invoice.taxAmount);
            doc
                .fontSize(12)
                .text(`Gross Amount: $${grossAmount.toFixed(2)}`, { align: 'right' });
            doc.text(`Platform Fee (${feePercent.toFixed(0)}%): -$${Number(invoice.feeAmount).toFixed(2)}`, { align: 'right' });
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
    async getPlatformFeePercent() {
        const adminServiceUrl = this.configService.get('ADMIN_SERVICE_URL', 'http://admin-service:3004');
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${adminServiceUrl}/api/public/configs/PLATFORM_FEE_PERCENT`));
            return parseFloat(data.value) || 10;
        }
        catch (error) {
            this.logger.warn(`Failed to fetch PLATFORM_FEE_PERCENT from admin-service, falling back to 10%. Error: ${error.message}`);
            return 10;
        }
    }
    async getEarningsStats(userId, period) {
        const stats = await this.prisma.invoice.findMany({
            where: { receiverId: userId, status: 'PAID' },
            select: { amount: true, createdAt: true },
        });
        const aggregates = new Map();
        stats.forEach((s) => {
            const date = new Date(s.createdAt);
            let periodLabel;
            if (period === 'daily') {
                periodLabel = date.toISOString().split('T')[0];
            }
            else if (period === 'weekly') {
                const week = (0, date_fns_1.getISOWeek)(date);
                const year = date.getUTCFullYear();
                periodLabel = `${year}-W${String(week).padStart(2, '0')}`;
            }
            else {
                periodLabel = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
            }
            const current = aggregates.get(periodLabel) || 0;
            aggregates.set(periodLabel, current + Number(s.amount));
        });
        const result = Array.from(aggregates.entries()).map(([label, total]) => ({
            period: label,
            totalEarnings: total,
        }));
        result.sort((a, b) => a.period.localeCompare(b.period));
        return result;
    }
    async updateAutoWithdrawalSettings(userId, data) {
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
    async getWithdrawalMethods(userId) {
        return this.prisma.withdrawalMethod.findMany({
            where: { userId },
        });
    }
    async addWithdrawalMethod(userId, data) {
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
    async deleteWithdrawalMethod(userId, id) {
        return this.prisma.withdrawalMethod.delete({
            where: { id, userId },
        });
    }
    async setDefaultWithdrawalMethod(userId, id) {
        await this.prisma.withdrawalMethod.updateMany({
            where: { userId },
            data: { isDefault: false },
        });
        return this.prisma.withdrawalMethod.update({
            where: { id, userId },
            data: { isDefault: true },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, typeof (_a = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _a : Object, config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map