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
        balance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        preferredCurrency: string;
        cryptoAddress: string | null;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: import("@prisma/client/runtime/library").Decimal | null;
        pendingBalance: import("@prisma/client/runtime/library").Decimal;
        autoWithdrawalMethodId: string | null;
        autoDepositEnabled: boolean;
        autoDepositThreshold: import("@prisma/client/runtime/library").Decimal | null;
        autoDepositAmount: import("@prisma/client/runtime/library").Decimal | null;
        paymentMethodId: string | null;
    }>;
    updatePreferredCurrency(req: any, currency: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        balance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        preferredCurrency: string;
        cryptoAddress: string | null;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: import("@prisma/client/runtime/library").Decimal | null;
        pendingBalance: import("@prisma/client/runtime/library").Decimal;
        autoWithdrawalMethodId: string | null;
        autoDepositEnabled: boolean;
        autoDepositThreshold: import("@prisma/client/runtime/library").Decimal | null;
        autoDepositAmount: import("@prisma/client/runtime/library").Decimal | null;
        paymentMethodId: string | null;
    }>;
    getWalletMe(req: any): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        balance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        preferredCurrency: string;
        cryptoAddress: string | null;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: import("@prisma/client/runtime/library").Decimal | null;
        pendingBalance: import("@prisma/client/runtime/library").Decimal;
        autoWithdrawalMethodId: string | null;
        autoDepositEnabled: boolean;
        autoDepositThreshold: import("@prisma/client/runtime/library").Decimal | null;
        autoDepositAmount: import("@prisma/client/runtime/library").Decimal | null;
        paymentMethodId: string | null;
    }>;
    getWallet(userId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        balance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        preferredCurrency: string;
        cryptoAddress: string | null;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: import("@prisma/client/runtime/library").Decimal | null;
        pendingBalance: import("@prisma/client/runtime/library").Decimal;
        autoWithdrawalMethodId: string | null;
        autoDepositEnabled: boolean;
        autoDepositThreshold: import("@prisma/client/runtime/library").Decimal | null;
        autoDepositAmount: import("@prisma/client/runtime/library").Decimal | null;
        paymentMethodId: string | null;
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
        balance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        preferredCurrency: string;
        cryptoAddress: string | null;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: import("@prisma/client/runtime/library").Decimal | null;
        pendingBalance: import("@prisma/client/runtime/library").Decimal;
        autoWithdrawalMethodId: string | null;
        autoDepositEnabled: boolean;
        autoDepositThreshold: import("@prisma/client/runtime/library").Decimal | null;
        autoDepositAmount: import("@prisma/client/runtime/library").Decimal | null;
        paymentMethodId: string | null;
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
        balance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        preferredCurrency: string;
        cryptoAddress: string | null;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: import("@prisma/client/runtime/library").Decimal | null;
        pendingBalance: import("@prisma/client/runtime/library").Decimal;
        autoWithdrawalMethodId: string | null;
        autoDepositEnabled: boolean;
        autoDepositThreshold: import("@prisma/client/runtime/library").Decimal | null;
        autoDepositAmount: import("@prisma/client/runtime/library").Decimal | null;
        paymentMethodId: string | null;
    }>;
    getMyWithdrawalMethods(req: any): Promise<{
        id: string;
        userId: string;
        type: string;
        provider: string | null;
        accountNumber: string;
        accountName: string;
        isDefault: boolean;
        isInstantCapable: boolean;
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
        isInstantCapable: boolean;
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
        isInstantCapable: boolean;
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
        isInstantCapable: boolean;
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
        isInstantCapable: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getInvoice(id: string): Promise<{
        invoiceNumber: string;
        date: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        feeAmount: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
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
        totalSpend: import("@prisma/client/runtime/library").Decimal;
    }>;
    getTransactionsByReference(id: string): Promise<{
        id: string;
        type: string;
        createdAt: Date;
        walletId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        status: string;
        referenceId: string | null;
        departmentId: string | null;
        description: string | null;
        clearedAt: Date | null;
        feeAmount: import("@prisma/client/runtime/library").Decimal;
        invoiceId: string | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    getAllTransactions(limit: number, offset: number): Promise<({
        wallet: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            balance: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            preferredCurrency: string;
            cryptoAddress: string | null;
            autoWithdrawalEnabled: boolean;
            autoWithdrawalSchedule: string | null;
            autoWithdrawalThreshold: import("@prisma/client/runtime/library").Decimal | null;
            pendingBalance: import("@prisma/client/runtime/library").Decimal;
            autoWithdrawalMethodId: string | null;
            autoDepositEnabled: boolean;
            autoDepositThreshold: import("@prisma/client/runtime/library").Decimal | null;
            autoDepositAmount: import("@prisma/client/runtime/library").Decimal | null;
            paymentMethodId: string | null;
        };
    } & {
        id: string;
        type: string;
        createdAt: Date;
        walletId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        status: string;
        referenceId: string | null;
        departmentId: string | null;
        description: string | null;
        clearedAt: Date | null;
        feeAmount: import("@prisma/client/runtime/library").Decimal;
        invoiceId: string | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    chargebackTransaction(id: string): Promise<{
        id: string;
        type: string;
        createdAt: Date;
        walletId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        status: string;
        referenceId: string | null;
        departmentId: string | null;
        description: string | null;
        clearedAt: Date | null;
        feeAmount: import("@prisma/client/runtime/library").Decimal;
        invoiceId: string | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
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
        taxRate: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
    }>;
    getTaxSettings(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        countryCode: string;
        taxRate: import("@prisma/client/runtime/library").Decimal;
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
        taxRate: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
    }>;
    getMyInvoices(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        status: string;
        feeAmount: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        invoiceNumber: string;
        senderId: string;
        receiverId: string;
        dueDate: Date | null;
        paidAt: Date | null;
        items: import("@prisma/client/runtime/library").JsonValue;
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
        balance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        preferredCurrency: string;
        cryptoAddress: string | null;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: import("@prisma/client/runtime/library").Decimal | null;
        pendingBalance: import("@prisma/client/runtime/library").Decimal;
        autoWithdrawalMethodId: string | null;
        autoDepositEnabled: boolean;
        autoDepositThreshold: import("@prisma/client/runtime/library").Decimal | null;
        autoDepositAmount: import("@prisma/client/runtime/library").Decimal | null;
        paymentMethodId: string | null;
    }>;
    getMetrics(): Promise<{
        totalVolume: number;
        totalPayments: number;
        totalWithdrawals: number;
        transactionCount: number;
    }>;
    getMyPaymentMethods(req: any): Promise<{
        id: string;
        userId: string;
        type: string;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
        last4: string | null;
        brand: string | null;
        token: string;
    }[]>;
    addPaymentMethod(req: any, body: any): Promise<{
        id: string;
        userId: string;
        type: string;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
        last4: string | null;
        brand: string | null;
        token: string;
    }>;
    deletePaymentMethod(req: any, id: string): Promise<{
        id: string;
        userId: string;
        type: string;
        isDefault: boolean;
        createdAt: Date;
        updatedAt: Date;
        last4: string | null;
        brand: string | null;
        token: string;
    }>;
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
        balance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        preferredCurrency: string;
        cryptoAddress: string | null;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: import("@prisma/client/runtime/library").Decimal | null;
        pendingBalance: import("@prisma/client/runtime/library").Decimal;
        autoWithdrawalMethodId: string | null;
        autoDepositEnabled: boolean;
        autoDepositThreshold: import("@prisma/client/runtime/library").Decimal | null;
        autoDepositAmount: import("@prisma/client/runtime/library").Decimal | null;
        paymentMethodId: string | null;
    }>;
    getTaxDocument(req: any, year: string, res: any): Promise<StreamableFile>;
    createSubscription(req: any, body: {
        planId: string;
        price: number;
    }): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        planId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        nextBillingDate: Date;
    }>;
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
        amount: import("@prisma/client/runtime/library").Decimal;
        status: string;
        referenceId: string | null;
        departmentId: string | null;
        description: string | null;
        clearedAt: Date | null;
        feeAmount: import("@prisma/client/runtime/library").Decimal;
        invoiceId: string | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
    processPayroll(body: {
        contractId: string;
        periodStart: string;
        periodEnd: string;
        grossAmount: number;
        employeeId: string;
    }): Promise<any>;
}
