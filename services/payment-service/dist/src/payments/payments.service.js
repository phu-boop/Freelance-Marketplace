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
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
            include: { transactions: { orderBy: { createdAt: 'desc' } } },
        });
        if (!wallet) {
            return this.createWallet(userId);
        }
        return wallet;
    }
    async deposit(userId, amount, referenceId) {
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
    async withdraw(userId, amount) {
        const wallet = await this.getWallet(userId);
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map