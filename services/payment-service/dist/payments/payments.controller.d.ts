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
    withdraw(req: any, body: {
        amount: number;
        methodId: string;
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
    getTransactions(req: any): Promise<any>;
    addWithdrawalMethod(req: any, body: {
        type: string;
        details: any;
        isDefault?: boolean;
    }): Promise<{
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
    getWithdrawalMethods(req: any): Promise<{
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
    findAllTaxSettings(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        countryCode: string;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        isActive: boolean;
    }[]>;
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
    refundEscrow(body: {
        contractId: string;
        milestoneId: string;
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
