import { StreamableFile } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { UpdateAutoWithdrawalDto } from './dto/update-auto-withdrawal.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    getWalletMe(req: any): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: import("@prisma/client-runtime-utils").Decimal | null;
        pendingBalance: import("@prisma/client-runtime-utils").Decimal;
        autoWithdrawalMethodId: string | null;
    }>;
    getWallet(userId: string): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: import("@prisma/client-runtime-utils").Decimal | null;
        pendingBalance: import("@prisma/client-runtime-utils").Decimal;
        autoWithdrawalMethodId: string | null;
    }>;
    deposit(body: {
        userId: string;
        amount: number;
        referenceId: string;
    }): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: import("@prisma/client-runtime-utils").Decimal | null;
        pendingBalance: import("@prisma/client-runtime-utils").Decimal;
        autoWithdrawalMethodId: string | null;
    }>;
    withdraw(body: {
        userId: string;
        amount: number;
    }): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: import("@prisma/client-runtime-utils").Decimal | null;
        pendingBalance: import("@prisma/client-runtime-utils").Decimal;
        autoWithdrawalMethodId: string | null;
    }>;
    getMyWithdrawalMethods(req: any): Promise<{
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
    addWithdrawalMethod(req: any, body: any): Promise<{
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
    deleteWithdrawalMethod(req: any, id: string): Promise<{
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
    setDefaultWithdrawalMethod(req: any, id: string): Promise<{
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
    getInvoice(id: string): Promise<{
        invoiceNumber: string;
        date: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        feeAmount: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        totalAmount: number;
        type: string;
        description: string | null;
        status: string;
        userId: string;
    }>;
    transfer(body: {
        fromUserId: string;
        toUserId: string;
        amount: number;
        description: string;
        referenceId?: string;
    }): Promise<{
        success: boolean;
        invoiceId: string;
    }>;
    getTransactionsByReference(id: string): Promise<{
        id: string;
        createdAt: Date;
        walletId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        type: string;
        status: string;
        referenceId: string | null;
        description: string | null;
        clearedAt: Date | null;
        feeAmount: import("@prisma/client-runtime-utils").Decimal;
        invoiceId: string | null;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
    }[]>;
    getAllTransactions(limit: number, offset: number): Promise<({
        wallet: {
            id: string;
            userId: string;
            balance: import("@prisma/client-runtime-utils").Decimal;
            currency: string;
            createdAt: Date;
            updatedAt: Date;
            autoWithdrawalEnabled: boolean;
            autoWithdrawalSchedule: string | null;
            autoWithdrawalThreshold: import("@prisma/client-runtime-utils").Decimal | null;
            pendingBalance: import("@prisma/client-runtime-utils").Decimal;
            autoWithdrawalMethodId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        walletId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        type: string;
        status: string;
        referenceId: string | null;
        description: string | null;
        clearedAt: Date | null;
        feeAmount: import("@prisma/client-runtime-utils").Decimal;
        invoiceId: string | null;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
    })[]>;
    chargebackTransaction(id: string): Promise<{
        id: string;
        createdAt: Date;
        walletId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        type: string;
        status: string;
        referenceId: string | null;
        description: string | null;
        clearedAt: Date | null;
        feeAmount: import("@prisma/client-runtime-utils").Decimal;
        invoiceId: string | null;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
    }>;
    createTaxSetting(body: {
        countryCode: string;
        taxRate: number;
        name: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        countryCode: string;
        taxRate: import("@prisma/client-runtime-utils").Decimal;
        isActive: boolean;
    }>;
    getTaxSettings(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        countryCode: string;
        taxRate: import("@prisma/client-runtime-utils").Decimal;
        isActive: boolean;
    }[]>;
    updateTaxSetting(id: string, body: {
        taxRate?: number;
        isActive?: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        countryCode: string;
        taxRate: import("@prisma/client-runtime-utils").Decimal;
        isActive: boolean;
    }>;
    getMyInvoices(req: any): Promise<{
        id: string;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        amount: import("@prisma/client-runtime-utils").Decimal;
        status: string;
        feeAmount: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        invoiceNumber: string;
        senderId: string;
        receiverId: string;
        dueDate: Date | null;
        paidAt: Date | null;
        items: import("@prisma/client/runtime/client").JsonValue;
    }[]>;
    downloadInvoice(id: string, res: any): Promise<StreamableFile>;
    getEarningsStats(req: any, period?: 'daily' | 'weekly' | 'monthly'): Promise<{
        period: string;
        totalEarnings: number;
    }[]>;
    getSpendingStats(req: any, period?: 'daily' | 'weekly' | 'monthly'): Promise<{
        period: string;
        totalSpending: number;
    }[]>;
    updateAutoWithdrawal(req: any, body: UpdateAutoWithdrawalDto): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: import("@prisma/client-runtime-utils").Decimal | null;
        pendingBalance: import("@prisma/client-runtime-utils").Decimal;
        autoWithdrawalMethodId: string | null;
    }>;
    getMetrics(): Promise<{
        totalVolume: number;
        totalPayments: number;
        totalWithdrawals: number;
        transactionCount: number;
    }>;
    getMyPaymentMethods(req: any): Promise<any>;
    addPaymentMethod(req: any, body: any): Promise<any>;
    deletePaymentMethod(req: any, id: string): Promise<any>;
    updateAutoDepositConfig(req: any, body: {
        enabled: boolean;
        threshold?: number;
        amount?: number;
        paymentMethodId?: string;
    }): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: import("@prisma/client-runtime-utils").Decimal | null;
        pendingBalance: import("@prisma/client-runtime-utils").Decimal;
        autoWithdrawalMethodId: string | null;
    }>;
    getTaxDocument(req: any, year: string, res: any): Promise<StreamableFile>;
}
