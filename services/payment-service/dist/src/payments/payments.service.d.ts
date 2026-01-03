import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class PaymentsService {
    private prisma;
    private httpService;
    private configService;
    private readonly logger;
    constructor(prisma: PrismaService, httpService: HttpService, configService: ConfigService);
    createWallet(userId: string): Promise<{
        id: string;
        userId: string;
        balance: Prisma.Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: Prisma.Decimal | null;
        pendingBalance: Prisma.Decimal;
        autoWithdrawalMethodId: string | null;
    }>;
    getWallet(userId: string): Promise<{
        id: string;
        userId: string;
        balance: Prisma.Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: Prisma.Decimal | null;
        pendingBalance: Prisma.Decimal;
        autoWithdrawalMethodId: string | null;
    }>;
    deposit(userId: string, amount: number, referenceId: string): Promise<{
        id: string;
        userId: string;
        balance: Prisma.Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: Prisma.Decimal | null;
        pendingBalance: Prisma.Decimal;
        autoWithdrawalMethodId: string | null;
    }>;
    withdraw(userId: string, amount: number): Promise<{
        id: string;
        userId: string;
        balance: Prisma.Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: Prisma.Decimal | null;
        pendingBalance: Prisma.Decimal;
        autoWithdrawalMethodId: string | null;
    }>;
    getInvoiceData(transactionId: string): Promise<{
        invoiceNumber: string;
        date: Date;
        amount: Prisma.Decimal;
        feeAmount: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        totalAmount: number;
        type: string;
        description: string | null;
        status: string;
        userId: string;
    }>;
    transfer(fromUserId: string, toUserId: string, amount: number, description: string, referenceId?: string): Promise<{
        success: boolean;
        invoiceId: string;
    }>;
    getTransactionsByReference(referenceId: string): Promise<{
        id: string;
        createdAt: Date;
        walletId: string;
        amount: Prisma.Decimal;
        type: string;
        status: string;
        referenceId: string | null;
        description: string | null;
        clearedAt: Date | null;
        feeAmount: Prisma.Decimal;
        invoiceId: string | null;
        taxAmount: Prisma.Decimal;
    }[]>;
    getMetrics(): Promise<{
        totalVolume: number;
        totalPayments: number;
        totalWithdrawals: number;
        transactionCount: number;
    }>;
    getInvoices(userId: string): Promise<{
        id: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        amount: Prisma.Decimal;
        status: string;
        feeAmount: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        invoiceNumber: string;
        senderId: string;
        receiverId: string;
        dueDate: Date | null;
        paidAt: Date | null;
        items: Prisma.JsonValue;
    }[]>;
    generateInvoicePdf(invoiceId: string): Promise<Buffer>;
    getPlatformFeePercent(): Promise<number>;
    getEarningsStats(userId: string, period: 'daily' | 'weekly' | 'monthly'): Promise<{
        period: string;
        totalEarnings: number;
    }[]>;
    updateAutoWithdrawalSettings(userId: string, data: any): Promise<{
        id: string;
        userId: string;
        balance: Prisma.Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: Prisma.Decimal | null;
        pendingBalance: Prisma.Decimal;
        autoWithdrawalMethodId: string | null;
    }>;
    getWithdrawalMethods(userId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        provider: string | null;
        accountNumber: string;
        accountName: string;
        isDefault: boolean;
    }[]>;
    addWithdrawalMethod(userId: string, data: any): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        provider: string | null;
        accountNumber: string;
        accountName: string;
        isDefault: boolean;
    }>;
    deleteWithdrawalMethod(userId: string, id: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        provider: string | null;
        accountNumber: string;
        accountName: string;
        isDefault: boolean;
    }>;
    setDefaultWithdrawalMethod(userId: string, id: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        provider: string | null;
        accountNumber: string;
        accountName: string;
        isDefault: boolean;
    }>;
}
