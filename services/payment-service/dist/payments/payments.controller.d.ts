import { PaymentsService } from './payments.service';
import { UpdateAutoWithdrawalDto } from './dto/update-auto-withdrawal.dto';
import { ListTransactionsDto } from './dto/list-transactions.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
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
        connectsBalance: number;
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
    getConnectsBalance(req: any): Promise<number>;
    buyConnects(req: any, amount: number): Promise<{
        success: boolean;
        connectsAdded: number;
        cost: number;
        totalConnects: number;
    }>;
    deductConnects(body: {
        userId: string;
        amount: number;
        reason: string;
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
        connectsBalance: number;
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
        connectsBalance: number;
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
        connectsBalance: number;
    }>;
    getTransactions(query: ListTransactionsDto, req: any): Promise<{
        total: number;
        data: ({
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
                connectsBalance: number;
            };
            invoice: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                status: string;
                feeAmount: import("@prisma/client/runtime/library").Decimal;
                invoiceNumber: string;
                senderId: string;
                receiverId: string;
                dueDate: Date | null;
                paidAt: Date | null;
                items: import("@prisma/client/runtime/library").JsonValue;
            } | null;
        } & {
            id: string;
            type: string;
            createdAt: Date;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            walletId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            status: string;
            referenceId: string | null;
            departmentId: string | null;
            costCenter: string | null;
            description: string | null;
            clearedAt: Date | null;
            feeAmount: import("@prisma/client/runtime/library").Decimal;
            invoiceId: string | null;
        })[];
    }>;
    getTransaction(id: string, req: any): Promise<{
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
            connectsBalance: number;
        };
        invoice: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            status: string;
            feeAmount: import("@prisma/client/runtime/library").Decimal;
            invoiceNumber: string;
            senderId: string;
            receiverId: string;
            dueDate: Date | null;
            paidAt: Date | null;
            items: import("@prisma/client/runtime/library").JsonValue;
        } | null;
    } & {
        id: string;
        type: string;
        createdAt: Date;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        walletId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        status: string;
        referenceId: string | null;
        departmentId: string | null;
        costCenter: string | null;
        description: string | null;
        clearedAt: Date | null;
        feeAmount: import("@prisma/client/runtime/library").Decimal;
        invoiceId: string | null;
    }>;
    updateTransactionStatus(id: string, body: UpdateTransactionStatusDto, req: any): Promise<{
        id: string;
        type: string;
        createdAt: Date;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        walletId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        status: string;
        referenceId: string | null;
        departmentId: string | null;
        costCenter: string | null;
        description: string | null;
        clearedAt: Date | null;
        feeAmount: import("@prisma/client/runtime/library").Decimal;
        invoiceId: string | null;
    }>;
    getAllTransactionsAdmin(query: ListTransactionsDto): Promise<{
        total: number;
        data: ({
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
                connectsBalance: number;
            };
            invoice: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                taxAmount: import("@prisma/client/runtime/library").Decimal;
                currency: string;
                amount: import("@prisma/client/runtime/library").Decimal;
                status: string;
                feeAmount: import("@prisma/client/runtime/library").Decimal;
                invoiceNumber: string;
                senderId: string;
                receiverId: string;
                dueDate: Date | null;
                paidAt: Date | null;
                items: import("@prisma/client/runtime/library").JsonValue;
            } | null;
        } & {
            id: string;
            type: string;
            createdAt: Date;
            taxAmount: import("@prisma/client/runtime/library").Decimal;
            walletId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            status: string;
            referenceId: string | null;
            departmentId: string | null;
            costCenter: string | null;
            description: string | null;
            clearedAt: Date | null;
            feeAmount: import("@prisma/client/runtime/library").Decimal;
            invoiceId: string | null;
        })[];
    }>;
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
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        walletId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        status: string;
        referenceId: string | null;
        departmentId: string | null;
        costCenter: string | null;
        description: string | null;
        clearedAt: Date | null;
        feeAmount: import("@prisma/client/runtime/library").Decimal;
        invoiceId: string | null;
    }>;
    refundEscrow(body: {
        contractId: string;
        milestoneId: string;
    }): Promise<{
        id: string;
        type: string;
        createdAt: Date;
        taxAmount: import("@prisma/client/runtime/library").Decimal;
        walletId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        status: string;
        referenceId: string | null;
        departmentId: string | null;
        costCenter: string | null;
        description: string | null;
        clearedAt: Date | null;
        feeAmount: import("@prisma/client/runtime/library").Decimal;
        invoiceId: string | null;
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
        connectsBalance: number;
    }>;
}
