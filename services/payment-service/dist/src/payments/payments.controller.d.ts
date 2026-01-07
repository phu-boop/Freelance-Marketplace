import { StreamableFile } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { UpdateAutoWithdrawalDto } from './dto/update-auto-withdrawal.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    getExchangeRates(base?: string): Promise<Record<string, number>>;
    updateCryptoAddress(req: any, address: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        balance: import("@prisma/client-runtime-utils").Decimal;
        pendingBalance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalThreshold: import("@prisma/client-runtime-utils").Decimal | null;
        autoWithdrawalSchedule: string | null;
    }>;
    updatePreferredCurrency(req: any, currency: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        balance: import("@prisma/client-runtime-utils").Decimal;
        pendingBalance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalThreshold: import("@prisma/client-runtime-utils").Decimal | null;
        autoWithdrawalSchedule: string | null;
    }>;
    getWalletMe(req: any): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        balance: import("@prisma/client-runtime-utils").Decimal;
        pendingBalance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalThreshold: import("@prisma/client-runtime-utils").Decimal | null;
        autoWithdrawalSchedule: string | null;
    }>;
    getWallet(userId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        balance: import("@prisma/client-runtime-utils").Decimal;
        pendingBalance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalThreshold: import("@prisma/client-runtime-utils").Decimal | null;
        autoWithdrawalSchedule: string | null;
    }>;
    getPredictiveRevenue(userId: string): Promise<{
        userId: string;
        currentStats: {
            totalEarned: number;
            pendingRevenue: number;
            availableBalance: number;
        };
        historicalTrend: {
            month: string;
            amount: number;
        }[];
        projections: {
            month: string;
            amount: number;
        }[];
    }>;
    deposit(body: {
        userId: string;
        amount: number;
        referenceId: string;
    }): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        balance: import("@prisma/client-runtime-utils").Decimal;
        pendingBalance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalThreshold: import("@prisma/client-runtime-utils").Decimal | null;
        autoWithdrawalSchedule: string | null;
    }>;
    withdraw(body: {
        userId: string;
        amount: number;
        instant?: boolean;
    }): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        balance: import("@prisma/client-runtime-utils").Decimal;
        pendingBalance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalThreshold: import("@prisma/client-runtime-utils").Decimal | null;
        autoWithdrawalSchedule: string | null;
    }>;
    getMyWithdrawalMethods(req: any): Promise<{
        id: string;
        userId: string;
        type: string;
        provider: string | null;
        accountNumber: string;
        accountName: string;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    addWithdrawalMethod(req: any, body: any): Promise<{
        id: string;
        userId: string;
        type: string;
        provider: string | null;
        accountNumber: string;
        accountName: string;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deleteWithdrawalMethod(req: any, id: string): Promise<{
        id: string;
        userId: string;
        type: string;
        provider: string | null;
        accountNumber: string;
        accountName: string;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    setDefaultWithdrawalMethod(req: any, id: string): Promise<{
        id: string;
        userId: string;
        type: string;
        provider: string | null;
        accountNumber: string;
        accountName: string;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    verifyInstantPay(req: any, id: string): Promise<{
        id: string;
        userId: string;
        type: string;
        provider: string | null;
        accountNumber: string;
        accountName: string;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
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
        teamId?: string;
        departmentId?: string;
    }): Promise<{
        success: boolean;
        status: string;
        transactionId: string;
        invoiceId?: undefined;
    } | {
        success: boolean;
        invoiceId: any;
        status?: undefined;
        transactionId?: undefined;
    }>;
    getDepartmentSpend(id: string): Promise<{
        departmentId: string;
        totalSpend: import("@prisma/client-runtime-utils").Decimal;
    }>;
    getTransactionsByReference(id: string): Promise<{
        id: string;
        type: string;
        createdAt: Date;
        walletId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        feeAmount: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        status: string;
        clearedAt: Date | null;
        referenceId: string | null;
        description: string | null;
        invoiceId: string | null;
    }[]>;
    getAllTransactions(limit: number, offset: number): Promise<({
        wallet: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            balance: import("@prisma/client-runtime-utils").Decimal;
            pendingBalance: import("@prisma/client-runtime-utils").Decimal;
            currency: string;
            autoWithdrawalEnabled: boolean;
            autoWithdrawalThreshold: import("@prisma/client-runtime-utils").Decimal | null;
            autoWithdrawalSchedule: string | null;
        };
    } & {
        id: string;
        type: string;
        createdAt: Date;
        walletId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        feeAmount: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        status: string;
        clearedAt: Date | null;
        referenceId: string | null;
        description: string | null;
        invoiceId: string | null;
    })[]>;
    chargebackTransaction(id: string): Promise<{
        id: string;
        type: string;
        createdAt: Date;
        walletId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        feeAmount: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        status: string;
        clearedAt: Date | null;
        referenceId: string | null;
        description: string | null;
        invoiceId: string | null;
    }>;
    approvePayment(id: string, req: any): Promise<{
        success: boolean;
        status: string;
        invoiceId: any;
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
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        status: string;
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
        createdAt: Date;
        updatedAt: Date;
        balance: import("@prisma/client-runtime-utils").Decimal;
        pendingBalance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalThreshold: import("@prisma/client-runtime-utils").Decimal | null;
        autoWithdrawalSchedule: string | null;
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
        createdAt: Date;
        updatedAt: Date;
        balance: import("@prisma/client-runtime-utils").Decimal;
        pendingBalance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalThreshold: import("@prisma/client-runtime-utils").Decimal | null;
        autoWithdrawalSchedule: string | null;
    }>;
    getTaxDocument(req: any, year: string, res: any): Promise<StreamableFile>;
    createSubscription(req: any, body: {
        planId: string;
        price: number;
    }): Promise<any>;
    fundEscrow(req: any, body: {
        contractId: string;
        milestoneId: string;
        amount: number;
    }): Promise<any>;
    releaseEscrow(body: {
        contractId: string;
        milestoneId: string;
        freelancerId: string;
    }): Promise<{
        id: string;
        type: string;
        createdAt: Date;
        walletId: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        feeAmount: import("@prisma/client-runtime-utils").Decimal;
        taxAmount: import("@prisma/client-runtime-utils").Decimal;
        status: string;
        clearedAt: Date | null;
        referenceId: string | null;
        description: string | null;
        invoiceId: string | null;
    }>;
    processPayroll(body: {
        contractId: string;
        periodStart: string;
        periodEnd: string;
        grossAmount: number;
        employeeId: string;
    }): Promise<any>;
}
