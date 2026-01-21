import { CurrencyService } from './currency.service';
import { PaymentsService } from './payments.service';
import { ListTransactionsDto } from './dto/list-transactions.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { UpdateAutoWithdrawalDto } from './dto/update-auto-withdrawal.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly currencyService;
    constructor(paymentsService: PaymentsService, currencyService: CurrencyService);
    getExchangeRates(base?: string): Promise<Record<string, number>>;
    convertCurrency(amount: number, from: string, to: string): Promise<{
        amount: number;
        formatted: string;
        currency: string;
    }>;
    updateCryptoAddress(req: any, address: string): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        preferredCurrency: string;
        cryptoAddress: string | null;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: import("@prisma/client/runtime/library").Decimal | null;
        pendingBalance: import("@prisma/client/runtime/library").Decimal;
        autoWithdrawalMethodId: string | null;
        autoDepositEnabled: boolean;
        autoDepositThreshold: import("@prisma/client/runtime/library").Decimal | null;
        autoDepositAmount: import("@prisma/client/runtime/library").Decimal | null;
        paymentMethodId: string | null;
        connectsBalance: number;
    }>;
    updatePreferredCurrency(req: any, currency: string): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        preferredCurrency: string;
        cryptoAddress: string | null;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: import("@prisma/client/runtime/library").Decimal | null;
        pendingBalance: import("@prisma/client/runtime/library").Decimal;
        autoWithdrawalMethodId: string | null;
        autoDepositEnabled: boolean;
        autoDepositThreshold: import("@prisma/client/runtime/library").Decimal | null;
        autoDepositAmount: import("@prisma/client/runtime/library").Decimal | null;
        paymentMethodId: string | null;
        connectsBalance: number;
    }>;
    getWalletMe(req: any): Promise<any>;
    getWallet(userId: string): Promise<any>;
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
    getAgencyWallet(agencyId: string): Promise<any>;
    getAgencyTransactions(agencyId: string, query: ListTransactionsDto): Promise<{
        total: number;
        data: ({
            wallet: {
                id: string;
                userId: string;
                balance: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                preferredCurrency: string;
                cryptoAddress: string | null;
                createdAt: Date;
                updatedAt: Date;
                autoWithdrawalEnabled: boolean;
                autoWithdrawalSchedule: string | null;
                autoWithdrawalThreshold: import("@prisma/client/runtime/library").Decimal | null;
                pendingBalance: import("@prisma/client/runtime/library").Decimal;
                autoWithdrawalMethodId: string | null;
                autoDepositEnabled: boolean;
                autoDepositThreshold: import("@prisma/client/runtime/library").Decimal | null;
                autoDepositAmount: import("@prisma/client/runtime/library").Decimal | null;
                paymentMethodId: string | null;
                connectsBalance: number;
            };
            invoice: {
                id: string;
                currency: string;
                createdAt: Date;
                updatedAt: Date;
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
            } | null;
        } & {
            id: string;
            createdAt: Date;
            walletId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            type: string;
            status: string;
            referenceId: string | null;
            departmentId: string | null;
            costCenter: string | null;
            description: string | null;
            clearedAt: Date | null;
            feeAmount: import("@prisma/client/runtime/library").Decimal;
            invoiceId: string | null;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
        })[];
    }>;
    withdrawAgency(req: any, body: {
        agencyId: string;
        amount: number;
        methodId: string;
        instant?: boolean;
    }): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        preferredCurrency: string;
        cryptoAddress: string | null;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: import("@prisma/client/runtime/library").Decimal | null;
        pendingBalance: import("@prisma/client/runtime/library").Decimal;
        autoWithdrawalMethodId: string | null;
        autoDepositEnabled: boolean;
        autoDepositThreshold: import("@prisma/client/runtime/library").Decimal | null;
        autoDepositAmount: import("@prisma/client/runtime/library").Decimal | null;
        paymentMethodId: string | null;
        connectsBalance: number;
    }>;
    getConnectsBalance(req: any): Promise<number>;
    buyConnects(req: any, amount: number): Promise<{
        success: boolean;
        connectsAdded: number;
        cost: any;
        totalConnects: number;
    }>;
    purchaseConnects(req: any, body: {
        bundleId: string;
    }): Promise<{
        success: boolean;
        newBalance: number;
    }>;
    getConnectsHistory(req: any): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        amount: number;
        type: string;
        reason: string | null;
    }[]>;
    rewardConnects(body: {
        userId: string;
        amount: number;
        reason: string;
    }): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        preferredCurrency: string;
        cryptoAddress: string | null;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: import("@prisma/client/runtime/library").Decimal | null;
        pendingBalance: import("@prisma/client/runtime/library").Decimal;
        autoWithdrawalMethodId: string | null;
        autoDepositEnabled: boolean;
        autoDepositThreshold: import("@prisma/client/runtime/library").Decimal | null;
        autoDepositAmount: import("@prisma/client/runtime/library").Decimal | null;
        paymentMethodId: string | null;
        connectsBalance: number;
    }>;
    deductConnects(body: {
        userId: string;
        amount: number;
        reason: string;
    }): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        preferredCurrency: string;
        cryptoAddress: string | null;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: import("@prisma/client/runtime/library").Decimal | null;
        pendingBalance: import("@prisma/client/runtime/library").Decimal;
        autoWithdrawalMethodId: string | null;
        autoDepositEnabled: boolean;
        autoDepositThreshold: import("@prisma/client/runtime/library").Decimal | null;
        autoDepositAmount: import("@prisma/client/runtime/library").Decimal | null;
        paymentMethodId: string | null;
        connectsBalance: number;
    }>;
    refundConnects(body: {
        userId: string;
        amount: number;
        reason: string;
    }): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        preferredCurrency: string;
        cryptoAddress: string | null;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: import("@prisma/client/runtime/library").Decimal | null;
        pendingBalance: import("@prisma/client/runtime/library").Decimal;
        autoWithdrawalMethodId: string | null;
        autoDepositEnabled: boolean;
        autoDepositThreshold: import("@prisma/client/runtime/library").Decimal | null;
        autoDepositAmount: import("@prisma/client/runtime/library").Decimal | null;
        paymentMethodId: string | null;
        connectsBalance: number;
    }>;
    deposit(body: {
        userId: string;
        amount: number;
        referenceId: string;
    }): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        preferredCurrency: string;
        cryptoAddress: string | null;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: import("@prisma/client/runtime/library").Decimal | null;
        pendingBalance: import("@prisma/client/runtime/library").Decimal;
        autoWithdrawalMethodId: string | null;
        autoDepositEnabled: boolean;
        autoDepositThreshold: import("@prisma/client/runtime/library").Decimal | null;
        autoDepositAmount: import("@prisma/client/runtime/library").Decimal | null;
        paymentMethodId: string | null;
        connectsBalance: number;
    }>;
    withdraw(req: any, body: {
        amount: number;
        methodId: string;
        instant?: boolean;
    }): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        preferredCurrency: string;
        cryptoAddress: string | null;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: import("@prisma/client/runtime/library").Decimal | null;
        pendingBalance: import("@prisma/client/runtime/library").Decimal;
        autoWithdrawalMethodId: string | null;
        autoDepositEnabled: boolean;
        autoDepositThreshold: import("@prisma/client/runtime/library").Decimal | null;
        autoDepositAmount: import("@prisma/client/runtime/library").Decimal | null;
        paymentMethodId: string | null;
        connectsBalance: number;
    }>;
    getTransactions(query: ListTransactionsDto, req: any): Promise<{
        total: number;
        data: ({
            wallet: {
                id: string;
                userId: string;
                balance: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                preferredCurrency: string;
                cryptoAddress: string | null;
                createdAt: Date;
                updatedAt: Date;
                autoWithdrawalEnabled: boolean;
                autoWithdrawalSchedule: string | null;
                autoWithdrawalThreshold: import("@prisma/client/runtime/library").Decimal | null;
                pendingBalance: import("@prisma/client/runtime/library").Decimal;
                autoWithdrawalMethodId: string | null;
                autoDepositEnabled: boolean;
                autoDepositThreshold: import("@prisma/client/runtime/library").Decimal | null;
                autoDepositAmount: import("@prisma/client/runtime/library").Decimal | null;
                paymentMethodId: string | null;
                connectsBalance: number;
            };
            invoice: {
                id: string;
                currency: string;
                createdAt: Date;
                updatedAt: Date;
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
            } | null;
        } & {
            id: string;
            createdAt: Date;
            walletId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            type: string;
            status: string;
            referenceId: string | null;
            departmentId: string | null;
            costCenter: string | null;
            description: string | null;
            clearedAt: Date | null;
            feeAmount: import("@prisma/client/runtime/library").Decimal;
            invoiceId: string | null;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
        })[];
    }>;
    getTransactionsByReference(referenceId: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        walletId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        type: string;
        status: string;
        referenceId: string | null;
        departmentId: string | null;
        costCenter: string | null;
        description: string | null;
        clearedAt: Date | null;
        feeAmount: import("@prisma/client/runtime/library").Decimal;
        invoiceId: string | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    getTransaction(id: string, req: any): Promise<{
        wallet: {
            id: string;
            userId: string;
            balance: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            preferredCurrency: string;
            cryptoAddress: string | null;
            createdAt: Date;
            updatedAt: Date;
            autoWithdrawalEnabled: boolean;
            autoWithdrawalSchedule: string | null;
            autoWithdrawalThreshold: import("@prisma/client/runtime/library").Decimal | null;
            pendingBalance: import("@prisma/client/runtime/library").Decimal;
            autoWithdrawalMethodId: string | null;
            autoDepositEnabled: boolean;
            autoDepositThreshold: import("@prisma/client/runtime/library").Decimal | null;
            autoDepositAmount: import("@prisma/client/runtime/library").Decimal | null;
            paymentMethodId: string | null;
            connectsBalance: number;
        };
        invoice: {
            id: string;
            currency: string;
            createdAt: Date;
            updatedAt: Date;
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
        } | null;
    } & {
        id: string;
        createdAt: Date;
        walletId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        type: string;
        status: string;
        referenceId: string | null;
        departmentId: string | null;
        costCenter: string | null;
        description: string | null;
        clearedAt: Date | null;
        feeAmount: import("@prisma/client/runtime/library").Decimal;
        invoiceId: string | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
    approveTransaction(id: string, req: any): Promise<{
        success: boolean;
        status: string;
        invoiceId?: undefined;
    } | {
        success: boolean;
        status: string;
        invoiceId: any;
    } | {
        message: string;
    }>;
    updateTransactionStatus(id: string, body: UpdateTransactionStatusDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        walletId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        type: string;
        status: string;
        referenceId: string | null;
        departmentId: string | null;
        costCenter: string | null;
        description: string | null;
        clearedAt: Date | null;
        feeAmount: import("@prisma/client/runtime/library").Decimal;
        invoiceId: string | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
    getAllTransactionsAdmin(query: ListTransactionsDto): Promise<{
        total: number;
        data: ({
            wallet: {
                id: string;
                userId: string;
                balance: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                preferredCurrency: string;
                cryptoAddress: string | null;
                createdAt: Date;
                updatedAt: Date;
                autoWithdrawalEnabled: boolean;
                autoWithdrawalSchedule: string | null;
                autoWithdrawalThreshold: import("@prisma/client/runtime/library").Decimal | null;
                pendingBalance: import("@prisma/client/runtime/library").Decimal;
                autoWithdrawalMethodId: string | null;
                autoDepositEnabled: boolean;
                autoDepositThreshold: import("@prisma/client/runtime/library").Decimal | null;
                autoDepositAmount: import("@prisma/client/runtime/library").Decimal | null;
                paymentMethodId: string | null;
                connectsBalance: number;
            };
            invoice: {
                id: string;
                currency: string;
                createdAt: Date;
                updatedAt: Date;
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
            } | null;
        } & {
            id: string;
            createdAt: Date;
            walletId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            type: string;
            status: string;
            referenceId: string | null;
            departmentId: string | null;
            costCenter: string | null;
            description: string | null;
            clearedAt: Date | null;
            feeAmount: import("@prisma/client/runtime/library").Decimal;
            invoiceId: string | null;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
        })[];
    }>;
    addWithdrawalMethod(req: any, body: {
        type: string;
        details: any;
        isDefault?: boolean;
    }): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        provider: string | null;
        accountNumber: string;
        accountName: string;
        isDefault: boolean;
        isInstantCapable: boolean;
    }>;
    getWithdrawalMethods(req: any): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        type: string;
        provider: string | null;
        accountNumber: string;
        accountName: string;
        isDefault: boolean;
        isInstantCapable: boolean;
    }[]>;
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
        isInstantCapable: boolean;
    }>;
    updateAutoWithdrawal(req: any, body: UpdateAutoWithdrawalDto): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        preferredCurrency: string;
        cryptoAddress: string | null;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: import("@prisma/client/runtime/library").Decimal | null;
        pendingBalance: import("@prisma/client/runtime/library").Decimal;
        autoWithdrawalMethodId: string | null;
        autoDepositEnabled: boolean;
        autoDepositThreshold: import("@prisma/client/runtime/library").Decimal | null;
        autoDepositAmount: import("@prisma/client/runtime/library").Decimal | null;
        paymentMethodId: string | null;
        connectsBalance: number;
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
        brackets: import("@prisma/client/runtime/library").JsonValue | null;
        isActive: boolean;
    }>;
    findAllTaxSettings(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        countryCode: string;
        taxRate: import("@prisma/client/runtime/library").Decimal;
        brackets: import("@prisma/client/runtime/library").JsonValue | null;
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
        autoRenew: boolean;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getSubscription(req: any): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        planId: string;
        price: import("@prisma/client/runtime/library").Decimal;
        nextBillingDate: Date;
        autoRenew: boolean;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    } | null>;
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
        createdAt: Date;
        walletId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        type: string;
        status: string;
        referenceId: string | null;
        departmentId: string | null;
        costCenter: string | null;
        description: string | null;
        clearedAt: Date | null;
        feeAmount: import("@prisma/client/runtime/library").Decimal;
        invoiceId: string | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
    requestEscrowApproval(body: {
        contractId: string;
        milestoneId: string;
        freelancerId: string;
        amount: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        walletId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        type: string;
        status: string;
        referenceId: string | null;
        departmentId: string | null;
        costCenter: string | null;
        description: string | null;
        clearedAt: Date | null;
        feeAmount: import("@prisma/client/runtime/library").Decimal;
        invoiceId: string | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
    splitEscrowRelease(body: {
        contractId: string;
        milestoneId: string;
        freelancerId: string;
        freelancerPercentage: number;
    }): Promise<{
        freelancerAmount: import("@prisma/client/runtime/library").Decimal;
        clientAmount: import("@prisma/client/runtime/library").Decimal;
    }>;
    refundEscrow(body: {
        contractId: string;
        milestoneId: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        walletId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        type: string;
        status: string;
        referenceId: string | null;
        departmentId: string | null;
        costCenter: string | null;
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
    previewPayroll(contractId: string, grossAmount: number, employeeId: string): Promise<{
        contract: any;
        employee: any;
        gross: import("@prisma/client/runtime/library").Decimal;
        eorFee: import("@prisma/client/runtime/library").Decimal;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        taxRate: number;
        totalBenefitsCost: import("@prisma/client/runtime/library").Decimal;
        netAmount: import("@prisma/client/runtime/library").Decimal;
        payrollBenefitsData: any[];
    }>;
    transfer(body: {
        fromUserId: string;
        toUserId: string;
        amount: number;
        description: string;
        referenceId?: string;
        teamId?: string;
        departmentId?: string;
        costCenter?: string;
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
    deductArbitrationFee(body: {
        userId: string;
        amount: number;
        contractId: string;
    }): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        preferredCurrency: string;
        cryptoAddress: string | null;
        createdAt: Date;
        updatedAt: Date;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalSchedule: string | null;
        autoWithdrawalThreshold: import("@prisma/client/runtime/library").Decimal | null;
        pendingBalance: import("@prisma/client/runtime/library").Decimal;
        autoWithdrawalMethodId: string | null;
        autoDepositEnabled: boolean;
        autoDepositThreshold: import("@prisma/client/runtime/library").Decimal | null;
        autoDepositAmount: import("@prisma/client/runtime/library").Decimal | null;
        paymentMethodId: string | null;
        connectsBalance: number;
    }>;
}
