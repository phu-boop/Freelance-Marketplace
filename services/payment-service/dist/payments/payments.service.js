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
const currency_converter_service_1 = require("./currency-converter.service");
const regional_gateway_service_1 = require("./regional-gateway.service");
const tax_calculation_service_1 = require("./tax-calculation.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    prisma;
    httpService;
    configService;
    currencyConverter;
    regionalGateway;
    taxCalculationService;
    logger = new common_1.Logger(PaymentsService_1.name);
    constructor(prisma, httpService, configService, currencyConverter, regionalGateway, taxCalculationService) {
        this.prisma = prisma;
        this.httpService = httpService;
        this.configService = configService;
        this.currencyConverter = currencyConverter;
        this.regionalGateway = regionalGateway;
        this.taxCalculationService = taxCalculationService;
    }
    async updateCryptoAddress(userId, cryptoAddress) {
        const wallet = await this.getWallet(userId);
        return this.prisma.wallet.update({
            where: { id: wallet.id },
            data: { cryptoAddress },
        });
    }
    async updatePreferredCurrency(userId, preferredCurrency) {
        const wallet = await this.getWallet(userId);
        return this.prisma.wallet.update({
            where: { id: wallet.id },
            data: { preferredCurrency },
        });
    }
    async getExchangeRates(base) {
        return this.currencyConverter.getExchangeRates(base);
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
        const result = { ...wallet };
        if (wallet.preferredCurrency && wallet.preferredCurrency !== 'USD') {
            const rate = (await this.currencyConverter.getExchangeRates('USD'))[wallet.preferredCurrency] || 1.0;
            result.localBalance = {
                currency: wallet.preferredCurrency,
                amount: Number(wallet.balance) * rate,
                pendingAmount: Number(wallet.pendingBalance) * rate,
            };
        }
        return result;
    }
    async deductConnects(userId, amount, reason) {
        const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
        if (!wallet)
            throw new common_1.NotFoundException('Wallet not found');
        if (wallet.connectsBalance < amount) {
            throw new common_1.BadRequestException('Insufficient connects balance');
        }
        const updated = await this.prisma.wallet.update({
            where: { id: wallet.id },
            data: { connectsBalance: { decrement: amount } },
        });
        await this.logFinancialEvent({
            service: 'payment-service',
            eventType: 'CONNECTS_DEDUCTED',
            actorId: userId,
            amount: 0,
            referenceId: wallet.id,
            metadata: {
                amountDeducted: amount,
                reason,
                remainingBalance: updated.connectsBalance,
            },
        });
        return updated;
    }
    async refundConnects(userId, amount, reason) {
        const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
        if (!wallet)
            throw new common_1.NotFoundException('Wallet not found');
        const updated = await this.prisma.wallet.update({
            where: { id: wallet.id },
            data: { connectsBalance: { increment: amount } },
        });
        await this.logFinancialEvent({
            service: 'payment-service',
            eventType: 'CONNECTS_REFUNDED',
            actorId: userId,
            amount: 0,
            referenceId: wallet.id,
            metadata: {
                reason,
                amount,
                newBalance: updated.connectsBalance,
            },
        });
        return updated;
    }
    async buyConnects(userId, amount) {
        const BUNDLES = {
            10: 1.50,
            50: 7.00,
            100: 12.00,
        };
        if (!BUNDLES[amount]) {
            throw new common_1.BadRequestException('Invalid connects bundle amount');
        }
        const totalCost = BUNDLES[amount];
        const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
        if (!wallet)
            throw new common_1.NotFoundException('Wallet not found');
        if (Number(wallet.balance) < totalCost) {
            throw new common_1.BadRequestException('Insufficient funds to buy connects');
        }
        return this.prisma.$transaction(async (prisma) => {
            await prisma.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: totalCost } },
            });
            const updated = await prisma.wallet.update({
                where: { id: wallet.id },
                data: { connectsBalance: { increment: amount } },
            });
            await prisma.transaction.create({
                data: {
                    walletId: wallet.id,
                    amount: new Decimal(totalCost),
                    type: 'CONNECTS_PURCHASE',
                    status: 'COMPLETED',
                    description: `Purchased ${amount} connects bundle`,
                },
            });
            await this.logFinancialEvent({
                service: 'payment-service',
                eventType: 'CONNECTS_PURCHASED',
                actorId: userId,
                amount: totalCost,
                referenceId: wallet.id,
                metadata: {
                    connectsAdded: amount,
                    totalConnects: updated.connectsBalance,
                    bundlePrice: totalCost,
                },
            });
            return { success: true, connectsAdded: amount, cost: totalCost, totalConnects: updated.connectsBalance };
        });
    }
    async getConnectsBalance(userId) {
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
            select: { connectsBalance: true },
        });
        if (!wallet)
            throw new common_1.NotFoundException('Wallet not found');
        return wallet.connectsBalance;
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
            const config = await this.getPaymentGatewayConfig();
            if (!config) {
                this.logger.warn('No Payment Gateway configuration found. Deposits might fail in production.');
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
    async withdraw(userId, amount, instant = false) {
        const wallet = await this.getWallet(userId);
        if (!wallet)
            throw new common_1.NotFoundException('Wallet not found');
        if (Number(wallet.balance) < amount) {
            throw new common_1.BadRequestException('Insufficient funds');
        }
        let fee = 0;
        let description = 'Withdrawal to Bank Account';
        let status = 'COMPLETED';
        if (instant) {
            const defaultMethod = await this.prisma.withdrawalMethod.findFirst({
                where: { userId, isDefault: true },
            });
            if (!defaultMethod) {
                throw new common_1.BadRequestException('No default withdrawal method found');
            }
            if (!defaultMethod.isInstantCapable) {
                throw new common_1.BadRequestException('Default withdrawal method is not eligible for Instant Pay');
            }
            const calculatedFee = amount * 0.015;
            fee = Math.max(calculatedFee, 2.0);
            if (Number(wallet.balance) < amount + fee) {
                throw new common_1.BadRequestException(`Insufficient funds to cover withdrawal plus instant fee of $${fee.toFixed(2)}`);
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
                    amount: totalDeduction,
                    feeAmount: fee,
                    type: 'WITHDRAWAL',
                    status,
                    description,
                },
            });
            const defaultMethod = await prisma.withdrawalMethod.findFirst({
                where: { userId, isDefault: true },
            });
            if (defaultMethod) {
                const regionalTypes = [
                    'MOMO',
                    'PIX',
                    'PROMPTPAY',
                    'M_PESA',
                    'WISE',
                    'PAYONEER',
                ];
                if (regionalTypes.includes(defaultMethod.type)) {
                    const targetCurrency = wallet.preferredCurrency || 'USD';
                    const localAmount = await this.currencyConverter.convert(amount, 'USD', targetCurrency);
                    await this.regionalGateway.processRegionalPayout(userId, localAmount, defaultMethod.id);
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
    async transfer(fromUserId, toUserId, amount, description, referenceId, teamId, departmentId, costCenter) {
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
            let status = 'COMPLETED';
            if (teamId) {
                const approvalCheck = await this.checkApproval(teamId, 'PAYMENT', amount);
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
                    costCenter,
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
            const invoice = await this.processRecipientCredit(prisma, fromUserId, toUserId, amount, feeAmount, netAmount, description, referenceId, costCenter);
            await this.logToAnalytics({
                userId: toUserId,
                counterpartyId: fromUserId,
                amount: Number(netAmount),
                currency: 'USD',
                category: 'Earnings',
                jobId: referenceId || '',
                transactionId: senderTx.id,
                costCenter: costCenter,
            });
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
    async getTransactionById(id, userId, isAdmin = false) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id },
            include: {
                wallet: true,
                invoice: true,
            },
        });
        if (!transaction)
            throw new common_1.NotFoundException('Transaction not found');
        if (!isAdmin && userId && transaction.wallet.userId !== userId) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return transaction;
    }
    async listTransactions(userId, opts = {}) {
        const { limit = 20, offset = 0, type, status } = opts;
        const where = {};
        if (userId) {
            where.wallet = { userId };
        }
        if (type)
            where.type = type;
        if (status)
            where.status = status;
        const [total, data] = await this.prisma.$transaction([
            this.prisma.transaction.count({ where }),
            this.prisma.transaction.findMany({
                where,
                take: Number(limit),
                skip: Number(offset),
                include: {
                    invoice: true,
                    wallet: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        return { total, data };
    }
    async updateTransactionStatus(id, status, actorId) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id },
        });
        if (!transaction)
            throw new common_1.NotFoundException('Transaction not found');
        const updated = await this.prisma.transaction.update({
            where: { id },
            data: { status },
        });
        await this.logFinancialEvent({
            service: 'payment-service',
            eventType: 'TRANSACTION_STATUS_UPDATED',
            actorId: actorId,
            amount: Number(transaction.amount),
            referenceId: transaction.id,
            metadata: {
                previousStatus: transaction.status,
                newStatus: status,
            },
        });
        return updated;
    }
    async getTransactionsByReference(referenceId) {
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
        const adminServiceUrl = this.configService.get('ADMIN_SERVICE_URL', 'http://admin-service:3009');
        try {
            const { data } = (await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${adminServiceUrl}/api/public/configs/PLATFORM_FEE_PERCENT`)));
            return parseFloat(data.value) || 10;
        }
        catch (error) {
            this.logger.warn(`Failed to fetch PLATFORM_FEE_PERCENT from admin-service, falling back to 10%. Error: ${error.message}`);
            return 10;
        }
    }
    async getPaymentGatewayConfig(provider = 'STRIPE') {
        const adminServiceUrl = this.configService.get('ADMIN_SERVICE_URL', 'http://admin-service:3009');
        try {
            const key = `GATEWAY_${provider.toUpperCase()}`;
            const { data } = (await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${adminServiceUrl}/api/public/configs/${key}`)));
            return data.value ? JSON.parse(data.value) : null;
        }
        catch (error) {
            this.logger.warn(`Failed to fetch gateway config for ${provider}: ${error.message}`);
            return null;
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
    async getSpendingStats(userId, period) {
        const stats = await this.prisma.invoice.findMany({
            where: { senderId: userId, status: 'PAID' },
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
            totalSpending: total,
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
                userId,
                type: data.type,
                provider: data.provider,
                accountNumber: data.accountNumber,
                accountName: data.accountName,
                isDefault: data.isDefault,
                isInstantCapable: data.isInstantCapable || false,
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
    async verifyInstantCapability(userId, id) {
        return this.prisma.withdrawalMethod.update({
            where: { id, userId },
            data: { isInstantCapable: true },
        });
    }
    async createSubscription(userId, data) {
        const wallet = await this.getWallet(userId);
        if (Number(wallet.balance) < data.price) {
            throw new common_1.BadRequestException('Insufficient funds in wallet');
        }
        return this.prisma.$transaction(async (prisma) => {
            await prisma.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: data.price } },
            });
            await prisma.transaction.create({
                data: {
                    walletId: wallet.id,
                    amount: data.price,
                    type: 'SUBSCRIPTION_FEE',
                    status: 'COMPLETED',
                    description: `Subscription: ${data.planId}`,
                },
            });
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
            if (data.planId === 'FREELANCER_PLUS') {
                await prisma.wallet.update({
                    where: { id: wallet.id },
                    data: { connectsBalance: { increment: 80 } }
                });
                await prisma.connectsHistory.create({
                    data: {
                        userId,
                        amount: 80,
                        type: 'SUBSCRIPTION_BONUS',
                        reason: 'Monthly Freelancer Plus bonus'
                    }
                });
            }
            try {
                const userServiceUrl = this.configService.get('USER_SERVICE_INTERNAL_URL', 'http://user-service:3000/api/users');
                await (0, rxjs_1.firstValueFrom)(this.httpService.patch(`${userServiceUrl}/${userId}/subscription-status`, {
                    tier: data.planId,
                    status: 'ACTIVE',
                    endsAt: nextBillingDate.toISOString(),
                }));
            }
            catch (error) {
                this.logger.error(`Failed to sync subscription status with user-service for user ${userId}: ${error.message}`);
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
    async fundEscrow(userId, data) {
        const wallet = await this.getWallet(userId);
        if (Number(wallet.balance) < data.amount) {
            throw new common_1.BadRequestException('Insufficient funds to fund escrow');
        }
        return this.prisma.$transaction(async (prisma) => {
            await prisma.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: data.amount } },
            });
            const transaction = await prisma.transaction.create({
                data: {
                    walletId: wallet.id,
                    amount: new Decimal(data.amount),
                    type: 'DESCROW_FUND',
                    status: 'COMPLETED',
                    costCenter: data.costCenter,
                    description: `Escrow Fund for Contract ${data.contractId} Milestone ${data.milestoneId}`,
                },
            });
            const hold = await prisma.escrowHold.create({
                data: {
                    walletId: wallet.id,
                    transactionId: transaction.id,
                    contractId: data.contractId,
                    milestoneId: data.milestoneId,
                    amount: new Decimal(data.amount),
                    costCenter: data.costCenter,
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
    async releaseEscrow(contractId, milestoneId, freelancerId) {
        const hold = await this.prisma.escrowHold.findFirst({
            where: { contractId, milestoneId, status: 'HELD' },
        });
        if (!hold) {
            throw new common_1.NotFoundException('No active escrow hold found for this milestone');
        }
        const contractUrl = this.configService.get('CONTRACT_SERVICE_URL', 'http://contract-service:3003');
        let contract;
        try {
            const contractRes = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${contractUrl}/api/contracts/${contractId}`));
            contract = contractRes.data;
            if (contract.status === 'DISPUTED') {
                throw new common_1.BadRequestException('Cannot release escrow while contract is in DISPUTED status. Please resolve arbitration first.');
            }
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            this.logger.error(`Failed to verify contract status: ${error.message}`);
            throw new common_1.BadRequestException('Could not verify contract status. Try again later.');
        }
        const freelancerWallet = await this.getWallet(freelancerId);
        return this.prisma.$transaction(async (prisma) => {
            let freelancerAmount = hold.amount;
            let agencyAmount = new Decimal(0);
            const agencyId = contract.agencyId;
            const agencySplit = contract.agencyRevenueSplit ? new Decimal(contract.agencyRevenueSplit) : new Decimal(0);
            if (agencyId && agencySplit.greaterThan(0)) {
                agencyAmount = hold.amount.mul(agencySplit).div(100);
                freelancerAmount = hold.amount.sub(agencyAmount);
                const agencyWallet = await this.getWallet(agencyId);
                await prisma.wallet.update({
                    where: { id: agencyWallet.id },
                    data: { balance: { increment: agencyAmount } },
                });
                await prisma.transaction.create({
                    data: {
                        walletId: agencyWallet.id,
                        amount: agencyAmount,
                        type: 'AGENCY_REVENUE_SHARE',
                        status: 'COMPLETED',
                        costCenter: hold.costCenter,
                        description: `Agency Revenue Share for Contract ${contractId} Milestone ${milestoneId}`,
                    },
                });
            }
            await prisma.wallet.update({
                where: { id: freelancerWallet.id },
                data: { balance: { increment: freelancerAmount } },
            });
            await prisma.escrowHold.update({
                where: { id: hold.id },
                data: { status: 'RELEASED' },
            });
            const tx = await prisma.transaction.create({
                data: {
                    walletId: freelancerWallet.id,
                    amount: freelancerAmount,
                    type: 'ESCROW_RELEASE',
                    status: 'COMPLETED',
                    costCenter: hold.costCenter,
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
                    agencyAmount: Number(agencyAmount),
                    freelancerAmount: Number(freelancerAmount),
                },
            });
            return tx;
        });
    }
    async refundEscrow(contractId, milestoneId) {
        const hold = await this.prisma.escrowHold.findFirst({
            where: { contractId, milestoneId, status: 'HELD' },
        });
        if (!hold) {
            throw new common_1.NotFoundException('No active escrow hold found for this milestone');
        }
        return this.prisma.$transaction(async (prisma) => {
            await prisma.wallet.update({
                where: { id: hold.walletId },
                data: { balance: { increment: hold.amount } },
            });
            await prisma.escrowHold.update({
                where: { id: hold.id },
                data: { status: 'REFUNDED' },
            });
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
    async calculatePayroll(contractId, grossAmount, employeeId) {
        const contractUrl = this.configService.get('CONTRACT_SERVICE_URL', 'http://contract-service:3003');
        const contractRes = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${contractUrl}/api/contracts/${contractId}`));
        const contract = contractRes.data;
        if (contract.type !== 'EOR')
            throw new common_1.BadRequestException('Not an EOR contract');
        const userUrl = this.configService.get('USER_SERVICE_INTERNAL_URL', 'http://user-service:3000/api/users');
        const userRes = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${userUrl}/${employeeId}`));
        const employee = userRes.data;
        const countryCode = employee.country || 'US';
        const gross = new Decimal(grossAmount);
        const eorFee = gross.mul(contract.eorFeePercentage || 5.0).div(100);
        const { taxAmount, taxRate } = await this.taxCalculationService.calculateTax(gross, countryCode);
        const benefitPlans = await this.prisma.benefitPlan.findMany({
            where: { isActive: true },
        });
        let totalBenefitsCost = new Decimal(0);
        const payrollBenefitsData = [];
        for (const plan of benefitPlans) {
            const amount = plan.monthlyCost.div(4);
            totalBenefitsCost = totalBenefitsCost.add(amount);
            payrollBenefitsData.push({
                benefitPlanId: plan.id,
                amount,
            });
        }
        const netAmount = gross.sub(taxAmount).sub(totalBenefitsCost);
        return {
            contract,
            employee,
            gross,
            eorFee,
            taxAmount,
            taxRate,
            totalBenefitsCost,
            netAmount,
            payrollBenefitsData,
        };
    }
    async processPayroll(contractId, data) {
        const { contract, gross, eorFee, taxAmount, taxRate, totalBenefitsCost, netAmount, payrollBenefitsData, } = await this.calculatePayroll(contractId, data.grossAmount, data.employeeId);
        const clientWallet = await this.getWallet(contract.client_id);
        return this.prisma.$transaction(async (prisma) => {
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
                    description: `Salary Payment (Net after ${taxRate}% Tax & Benefits)`,
                },
            });
            const payroll = await prisma.payroll.create({
                data: {
                    contractId,
                    employeeId: data.employeeId,
                    periodStart: data.periodStart,
                    periodEnd: data.periodEnd,
                    grossAmount: gross,
                    taxAmount,
                    benefitsAmount: totalBenefitsCost,
                    netAmount,
                    status: 'PAID',
                },
            });
            if (payrollBenefitsData.length > 0) {
                await prisma.payrollBenefit.createMany({
                    data: payrollBenefitsData.map(pb => ({
                        benefitPlanId: pb.benefitPlanId,
                        amount: pb.amount,
                        payrollId: payroll.id,
                    })),
                });
            }
            return payroll;
        });
    }
    async addPaymentMethod(userId, data) {
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
    async getPaymentMethods(userId) {
        return this.prisma.paymentMethod.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async deletePaymentMethod(userId, id) {
        return this.prisma.paymentMethod.delete({
            where: { id, userId },
        });
    }
    async updateAutoDepositConfig(userId, data) {
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
    async checkAndTriggerAutoDeposit(userId) {
        const wallet = await this.getWallet(userId);
        if (wallet.autoDepositEnabled &&
            wallet.autoDepositThreshold &&
            wallet.autoDepositAmount &&
            wallet.balance.lessThan(wallet.autoDepositThreshold)) {
            this.logger.log(`Triggering auto-deposit for user ${userId}. Balance: ${wallet.balance}, Threshold: ${wallet.autoDepositThreshold}`);
            const referenceId = `AUTO-DEP-${Date.now()}`;
            await this.deposit(userId, Number(wallet.autoDepositAmount), referenceId);
            this.logger.log(`Auto-deposit of ${wallet.autoDepositAmount} successful for user ${userId}`);
        }
    }
    async getTaxYearSummary(userId, year) {
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
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
        const grossVolume = invoices.reduce((sum, inv) => sum +
            Number(inv.amount) +
            Number(inv.feeAmount) +
            Number(inv.taxAmount), 0);
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
    async generateTaxDocumentPdf(userId, year) {
        const summary = await this.getTaxYearSummary(userId, year);
        if (summary.transactionCount === 0) {
            throw new common_1.NotFoundException(`No transactions found for tax year ${year}`);
        }
        return new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default();
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);
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
            doc.fontSize(12).text(`Account ID: ${userId}`);
            doc.moveDown();
            doc.moveTo(50, 200).lineTo(550, 200).stroke();
            doc.moveDown();
            const startX = 50;
            let currentY = 220;
            doc.fontSize(12).text('Metric', startX, currentY);
            doc.text('Amount (USD)', 400, currentY, { align: 'right' });
            currentY += 20;
            doc.text('Gross Payment Volume', startX, currentY);
            doc.text(`$${summary.grossVolume.toFixed(2)}`, 400, currentY, {
                align: 'right',
            });
            currentY += 20;
            doc.text('Platform Fees & Adjustments', startX, currentY);
            doc.text(`-$${summary.feesPaid.toFixed(2)}`, 400, currentY, {
                align: 'right',
            });
            currentY += 20;
            doc.text('Tax Withheld', startX, currentY);
            doc.text(`-$${summary.taxWithheld.toFixed(2)}`, 400, currentY, {
                align: 'right',
            });
            currentY += 20;
            doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
            currentY += 10;
            doc.font('Helvetica-Bold').text('Net Income', startX, currentY);
            doc.text(`$${summary.netVolume.toFixed(2)}`, 400, currentY, {
                align: 'right',
            });
            currentY += 40;
            doc
                .font('Helvetica')
                .fontSize(10)
                .text('Note: This document is a preview for informational purposes only and is not an official IRS form 1099-K. Please consult a tax professional.', 50, currentY, { width: 500, align: 'center' });
            doc.end();
        });
    }
    async processChargeback(transactionId) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { wallet: true },
        });
        if (!transaction)
            throw new common_1.NotFoundException('Transaction not found');
        if (transaction.status === 'CHARGEBACK') {
            throw new common_1.BadRequestException('Transaction already charged back');
        }
        if (transaction.type !== 'PAYMENT') {
            throw new common_1.BadRequestException('Only payments can be charged back');
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
    async logFinancialEvent(data) {
        const auditServiceUrl = this.configService.get('AUDIT_SERVICE_URL', 'http://audit-service:3011');
        const auditSecret = this.configService.get('AUDIT_SECRET', 'fallback-secret');
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${auditServiceUrl}/api/audit/logs`, data, {
                headers: { 'x-audit-secret': auditSecret },
            }));
        }
        catch (error) {
            this.logger.error(`Failed to log financial event to audit-service: ${error.message}`);
        }
    }
    async createTaxSetting(data) {
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
    async updateTaxSetting(id, data) {
        return this.prisma.taxSetting.update({
            where: { id },
            data: {
                ...(data.taxRate && { taxRate: new Decimal(data.taxRate) }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
            },
        });
    }
    async getPredictiveRevenue(userId) {
        const now = new Date();
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(now.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);
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
        const historicalData = {};
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
        let contracts = [];
        try {
            const contractServiceUrl = this.configService.get('CONTRACT_SERVICE_URL', 'http://contract-service:3000');
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${contractServiceUrl}/api/contracts/internal/freelancer/${userId}`));
            contracts = response.data;
        }
        catch (err) {
            this.logger.error(`Failed to fetch contracts for predictive revenue: ${err.message}`);
        }
        let pendingRevenue = 0;
        const projections = {};
        for (let i = 0; i < 4; i++) {
            const d = new Date();
            d.setMonth(now.getMonth() + i);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            projections[key] = 0;
        }
        contracts.forEach((contract) => {
            if (contract.status === 'ACTIVE' || contract.status === 'DISPUTED') {
                contract.milestones?.forEach((m) => {
                    if (m.status === 'IN_REVIEW') {
                        pendingRevenue += Number(m.amount);
                    }
                    else if (m.status === 'PENDING' || m.status === 'ACTIVE') {
                        const dueDate = m.dueDate ? new Date(m.dueDate) : null;
                        if (dueDate && dueDate >= now) {
                            const key = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`;
                            if (projections[key] !== undefined) {
                                projections[key] += Number(m.amount);
                            }
                        }
                    }
                });
            }
        });
        return {
            userId,
            currentStats: {
                totalEarned: historicalTxs.reduce((sum, tx) => sum + Number(tx.amount), 0),
                pendingRevenue,
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
    async processRecipientCredit(prisma, fromUserId, toUserId, grossAmount, feeAmount, netAmount, description, referenceId, costCenter) {
        const toWallet = await this.getWallet(toUserId);
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
                costCenter,
                invoiceId: invoice.id,
            },
        });
        return invoice;
    }
    async checkApproval(teamId, triggerType, amount) {
        try {
            const userServiceUrl = this.configService.get('USER_SERVICE_URL', 'http://user-service:3001');
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${userServiceUrl}/api/user/teams/${teamId}/policies/check`, {
                params: { type: triggerType, amount },
            }));
            return data;
        }
        catch (error) {
            this.logger.error(`Failed to check approval policy: ${error.message}`);
            return { required: false };
        }
    }
    async approvePayment(transactionId, userId) {
        const tx = await this.prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { approvalParams: true, wallet: true },
        });
        if (!tx)
            throw new common_1.NotFoundException('Transaction not found');
        if (tx.status !== 'PENDING_APPROVAL')
            throw new common_1.ConflictException('Transaction not pending approval');
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
                throw new Error('Could not determine recipient from transaction description');
            const toUserId = match[1];
            const description = tx.description?.split(': ')[1] || 'Payment';
            const invoice = await this.processRecipientCredit(prisma, tx.wallet.userId, toUserId, amount, feeAmount, netAmount, description, tx.referenceId || undefined);
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
            await this.logToAnalytics({
                userId: toUserId,
                counterpartyId: tx.wallet.userId,
                amount: Number(netAmount),
                currency: 'USD',
                category: 'Earnings',
                jobId: tx.referenceId || '',
                transactionId: transactionId,
                costCenter: tx.costCenter || '',
            });
            return { success: true, status: 'APPROVED', invoiceId: invoice.id };
        });
    }
    async getDepartmentSpend(departmentId) {
        const transactions = await this.prisma.transaction.findMany({
            where: { departmentId },
            select: { amount: true },
        });
        const totalSpend = transactions.reduce((acc, tx) => acc + Number(tx.amount), 0);
        return { departmentId, totalSpend: new Decimal(totalSpend) };
    }
    async logToAnalytics(data) {
        const analyticsUrl = this.configService.get('ANALYTICS_SERVICE_URL', 'http://analytics-service:8000');
        try {
            await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${analyticsUrl}/api/analytics/financials`, {
                ...data,
                cost_center: data.costCenter,
            }));
        }
        catch (error) {
            this.logger.error(`Failed to log financial event to analytics-service: ${error.message}`);
        }
    }
    async deductArbitrationFee(userId, amount, contractId) {
        const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
        if (!wallet)
            throw new common_1.NotFoundException('Wallet not found');
        if (Number(wallet.balance) < amount) {
            throw new common_1.BadRequestException('Insufficient funds for arbitration fee');
        }
        return this.prisma.$transaction(async (prisma) => {
            const updated = await prisma.wallet.update({
                where: { id: wallet.id },
                data: { balance: { decrement: amount } },
            });
            await prisma.transaction.create({
                data: {
                    walletId: wallet.id,
                    amount: new Decimal(amount),
                    type: 'ARBITRATION_FEE',
                    status: 'COMPLETED',
                    referenceId: contractId,
                    description: `Arbitration fee for contract ${contractId}`,
                },
            });
            return updated;
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        axios_1.HttpService,
        config_1.ConfigService,
        currency_converter_service_1.CurrencyConverterService,
        regional_gateway_service_1.RegionalGatewayService,
        tax_calculation_service_1.TaxCalculationService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map