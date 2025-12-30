import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentsService {
    private prisma;
    constructor(prisma: PrismaService);
    createWallet(userId: string): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        pendingBalance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalThreshold: import("@prisma/client-runtime-utils").Decimal | null;
        autoWithdrawalSchedule: string | null;
    }>;
    getWallet(userId: string): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        pendingBalance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalThreshold: import("@prisma/client-runtime-utils").Decimal | null;
        autoWithdrawalSchedule: string | null;
    }>;
    deposit(userId: string, amount: number, referenceId: string): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        pendingBalance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalThreshold: import("@prisma/client-runtime-utils").Decimal | null;
        autoWithdrawalSchedule: string | null;
    }>;
    withdraw(userId: string, amount: number): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        pendingBalance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalThreshold: import("@prisma/client-runtime-utils").Decimal | null;
        autoWithdrawalSchedule: string | null;
    }>;
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
    deleteWithdrawalMethod(userId: string, id: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
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
    getInvoiceData(transactionId: string): Promise<{
        invoiceNumber: string;
        date: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        type: string;
        description: string | null;
        status: string;
        userId: string;
    }>;
    transfer(fromUserId: string, toUserId: string, amount: number, description: string, referenceId?: string): Promise<{
        success: boolean;
    }>;
    getTransactionsByReference(referenceId: string): Promise<{
        id: string;
        createdAt: Date;
        walletId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        feeAmount: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        type: string;
        status: string;
        clearedAt: Date | null;
        referenceId: string | null;
        description: string | null;
        invoiceId: string | null;
    }[]>;
    getMetrics(): Promise<{
        totalVolume: number;
        totalPayments: number;
        totalWithdrawals: number;
        transactionCount: number;
    }>;
}
