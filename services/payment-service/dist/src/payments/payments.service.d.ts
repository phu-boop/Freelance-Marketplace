import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CurrencyConverterService } from './currency-converter.service';
import { RegionalGatewayService } from './regional-gateway.service';
export declare class PaymentsService {
    private prisma;
    private httpService;
    private configService;
    private currencyConverter;
    private regionalGateway;
    private readonly logger;
    constructor(prisma: PrismaService, httpService: HttpService, configService: ConfigService, currencyConverter: CurrencyConverterService, regionalGateway: RegionalGatewayService);
    updateCryptoAddress(userId: string, cryptoAddress: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        balance: Prisma.Decimal;
        pendingBalance: Prisma.Decimal;
        currency: string;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalThreshold: Prisma.Decimal | null;
        autoWithdrawalSchedule: string | null;
    }>;
    updatePreferredCurrency(userId: string, preferredCurrency: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        balance: Prisma.Decimal;
        pendingBalance: Prisma.Decimal;
        currency: string;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalThreshold: Prisma.Decimal | null;
        autoWithdrawalSchedule: string | null;
    }>;
    getExchangeRates(base?: string): Promise<Record<string, number>>;
    createWallet(userId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        balance: Prisma.Decimal;
        pendingBalance: Prisma.Decimal;
        currency: string;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalThreshold: Prisma.Decimal | null;
        autoWithdrawalSchedule: string | null;
    }>;
    getWallet(userId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        balance: Prisma.Decimal;
        pendingBalance: Prisma.Decimal;
        currency: string;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalThreshold: Prisma.Decimal | null;
        autoWithdrawalSchedule: string | null;
    }>;
    deposit(userId: string, amount: number, referenceId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        balance: Prisma.Decimal;
        pendingBalance: Prisma.Decimal;
        currency: string;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalThreshold: Prisma.Decimal | null;
        autoWithdrawalSchedule: string | null;
    }>;
    withdraw(userId: string, amount: number, instant?: boolean): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        balance: Prisma.Decimal;
        pendingBalance: Prisma.Decimal;
        currency: string;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalThreshold: Prisma.Decimal | null;
        autoWithdrawalSchedule: string | null;
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
    transfer(fromUserId: string, toUserId: string, amount: number, description: string, referenceId?: string, teamId?: string, departmentId?: string): Promise<{
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
    getTransactionsByReference(referenceId: string): Promise<{
        id: string;
        type: string;
        createdAt: Date;
        walletId: string;
        amount: Prisma.Decimal;
        feeAmount: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        status: string;
        clearedAt: Date | null;
        referenceId: string | null;
        description: string | null;
        invoiceId: string | null;
    }[]>;
    getAllTransactions(limit?: number, offset?: number): Promise<({
        wallet: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            balance: Prisma.Decimal;
            pendingBalance: Prisma.Decimal;
            currency: string;
            autoWithdrawalEnabled: boolean;
            autoWithdrawalThreshold: Prisma.Decimal | null;
            autoWithdrawalSchedule: string | null;
        };
    } & {
        id: string;
        type: string;
        createdAt: Date;
        walletId: string;
        amount: Prisma.Decimal;
        feeAmount: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        status: string;
        clearedAt: Date | null;
        referenceId: string | null;
        description: string | null;
        invoiceId: string | null;
    })[]>;
    getMetrics(): Promise<{
        totalVolume: number;
        totalPayments: number;
        totalWithdrawals: number;
        transactionCount: number;
    }>;
    getInvoices(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        amount: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        status: string;
        invoiceNumber: string;
        senderId: string;
        receiverId: string;
        dueDate: Date | null;
        paidAt: Date | null;
        items: Prisma.JsonValue;
    }[]>;
    generateInvoicePdf(invoiceId: string): Promise<Buffer>;
    getPlatformFeePercent(): Promise<number>;
    getPaymentGatewayConfig(provider?: string): Promise<any>;
    getEarningsStats(userId: string, period: 'daily' | 'weekly' | 'monthly'): Promise<{
        period: string;
        totalEarnings: number;
    }[]>;
    getSpendingStats(userId: string, period: 'daily' | 'weekly' | 'monthly'): Promise<{
        period: string;
        totalSpending: number;
    }[]>;
    updateAutoWithdrawalSettings(userId: string, data: any): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        balance: Prisma.Decimal;
        pendingBalance: Prisma.Decimal;
        currency: string;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalThreshold: Prisma.Decimal | null;
        autoWithdrawalSchedule: string | null;
    }>;
    getWithdrawalMethods(userId: string): Promise<{
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
    addWithdrawalMethod(userId: string, data: any): Promise<{
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
    deleteWithdrawalMethod(userId: string, id: string): Promise<{
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
    setDefaultWithdrawalMethod(userId: string, id: string): Promise<{
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
    verifyInstantCapability(userId: string, id: string): Promise<{
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
    createSubscription(userId: string, data: {
        planId: string;
        price: number;
    }): Promise<any>;
    fundEscrow(userId: string, data: {
        contractId: string;
        milestoneId: string;
        amount: number;
    }): Promise<any>;
    releaseEscrow(contractId: string, milestoneId: string, freelancerId: string): Promise<{
        id: string;
        type: string;
        createdAt: Date;
        walletId: string;
        amount: Prisma.Decimal;
        feeAmount: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        status: string;
        clearedAt: Date | null;
        referenceId: string | null;
        description: string | null;
        invoiceId: string | null;
    }>;
    processPayroll(contractId: string, data: {
        periodStart: Date;
        periodEnd: Date;
        grossAmount: number;
        employeeId: string;
    }): Promise<any>;
    addPaymentMethod(userId: string, data: any): Promise<any>;
    getPaymentMethods(userId: string): Promise<any>;
    deletePaymentMethod(userId: string, id: string): Promise<any>;
    updateAutoDepositConfig(userId: string, data: {
        enabled: boolean;
        threshold?: number;
        amount?: number;
        paymentMethodId?: string;
    }): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        balance: Prisma.Decimal;
        pendingBalance: Prisma.Decimal;
        currency: string;
        autoWithdrawalEnabled: boolean;
        autoWithdrawalThreshold: Prisma.Decimal | null;
        autoWithdrawalSchedule: string | null;
    }>;
    checkAndTriggerAutoDeposit(userId: string): Promise<void>;
    getTaxYearSummary(userId: string, year: number): Promise<{
        userId: string;
        year: number;
        grossVolume: number;
        feesPaid: number;
        taxWithheld: number;
        netVolume: number;
        transactionCount: number;
        generatedAt: Date;
    }>;
    generateTaxDocumentPdf(userId: string, year: number): Promise<Buffer>;
    processChargeback(transactionId: string): Promise<{
        id: string;
        type: string;
        createdAt: Date;
        walletId: string;
        amount: Prisma.Decimal;
        feeAmount: Prisma.Decimal;
        taxAmount: Prisma.Decimal;
        status: string;
        clearedAt: Date | null;
        referenceId: string | null;
        description: string | null;
        invoiceId: string | null;
    }>;
    private logFinancialEvent;
    createTaxSetting(data: {
        countryCode: string;
        taxRate: number;
        name: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        countryCode: string;
        taxRate: Prisma.Decimal;
        isActive: boolean;
    }>;
    getTaxSettings(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        countryCode: string;
        taxRate: Prisma.Decimal;
        isActive: boolean;
    }[]>;
    updateTaxSetting(id: string, data: {
        taxRate?: number;
        isActive?: boolean;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        countryCode: string;
        taxRate: Prisma.Decimal;
        isActive: boolean;
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
    processRecipientCredit(prisma: any, fromUserId: string, toUserId: string, grossAmount: number, feeAmount: number, netAmount: number, description: string, referenceId?: string): Promise<any>;
    checkApproval(teamId: string, triggerType: string, amount: number): Promise<any>;
    approvePayment(transactionId: string, userId: string): Promise<{
        success: boolean;
        status: string;
        invoiceId: any;
    }>;
    getDepartmentSpend(departmentId: string): Promise<{
        departmentId: string;
        totalSpend: Prisma.Decimal;
    }>;
}
