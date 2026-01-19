import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CurrencyConverterService } from './currency-converter.service';
import { RegionalGatewayService } from './regional-gateway.service';
import { TaxCalculationService } from './tax-calculation.service';
import { of } from 'rxjs';
import { Decimal } from '@prisma/client/runtime/library';

describe('PaymentsService - Financial Scaling', () => {
    let service: PaymentsService;
    let prisma: PrismaService;

    const mockPrisma = {
        wallet: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        transaction: {
            create: jest.fn(),
        },
        benefitPlan: {
            findMany: jest.fn(),
        },
        payroll: {
            create: jest.fn(),
        },
        payrollBenefit: {
            createMany: jest.fn(),
        },
        withdrawalMethod: {
            findFirst: jest.fn(),
        },
        $transaction: jest.fn((cb) => cb(mockPrisma)),
    };

    const mockHttp = {
        get: jest.fn(),
    };

    const mockConfig = {
        get: jest.fn((key) => {
            if (key === 'CONTRACT_SERVICE_URL') return 'http://contract-service';
            if (key === 'USER_SERVICE_INTERNAL_URL') return 'http://user-service';
            return null;
        }),
    };

    const mockCurrency = {
        convert: jest.fn((amount) => Promise.resolve(amount)),
    };

    const mockRegional = {
        processRegionalPayout: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockTax = {
        calculateTax: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentsService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: HttpService, useValue: mockHttp },
                { provide: ConfigService, useValue: mockConfig },
                { provide: CurrencyConverterService, useValue: mockCurrency },
                { provide: RegionalGatewayService, useValue: mockRegional },
                { provide: TaxCalculationService, useValue: mockTax },
            ],
        }).compile();

        service = module.get<PaymentsService>(PaymentsService);
        prisma = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
        jest.spyOn(service as any, 'logFinancialEvent').mockImplementation(() => of(null));
    });

    describe('processPayroll', () => {
        it('should calculate payroll with taxes and benefits correctly', async () => {
            const contractId = 'cont1';
            const employeeId = 'emp1';
            const clientId = 'client1';
            const grossAmount = 1000;

            const mockContract = { id: contractId, type: 'EOR', client_id: clientId, eorFeePercentage: 5 };
            const mockEmployee = { id: employeeId, country: 'VN' };
            const mockBenefitPlans = [{ id: 'b1', monthlyCost: new Decimal(400), isActive: true }];

            mockHttp.get.mockImplementation((url) => {
                if (url.includes('contracts')) return of({ data: mockContract });
                if (url.includes('users')) return of({ data: mockEmployee });
                return of({ data: {} });
            });

            mockTax.calculateTax.mockResolvedValue({ taxAmount: new Decimal(100), taxRate: 10 });
            mockPrisma.benefitPlan.findMany.mockResolvedValue(mockBenefitPlans);

            // Mock getWallet
            const clientWallet = { id: 'w-client', userId: clientId, balance: new Decimal(2000), transactions: [] };
            const empWallet = { id: 'w-emp', userId: employeeId, balance: new Decimal(0), transactions: [] };

            mockPrisma.wallet.findUnique.mockImplementation(({ where }) => {
                if (where.userId === clientId) return Promise.resolve(clientWallet);
                if (where.userId === employeeId) return Promise.resolve(empWallet);
                return Promise.resolve(null);
            });

            mockPrisma.payroll.create.mockResolvedValue({ id: 'p1' });

            const result = await service.processPayroll(contractId, {
                periodStart: new Date(),
                periodEnd: new Date(),
                grossAmount,
                employeeId,
            });

            // Gross (1000) - Tax (100) - Benefits (400/4 = 100) = 800
            expect(mockPrisma.wallet.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: empWallet.id },
                data: { balance: { increment: new Decimal(800) } }
            }));

            // Client deduction: Gross (1000) + Fee (5% of 1000 = 50) = 1050
            expect(mockPrisma.wallet.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: clientWallet.id },
                data: { balance: { decrement: new Decimal(1050) } }
            }));
        });
    });

    describe('withdraw (Instant Payout)', () => {
        it('should apply 1.5% fee for instant withdrawal', async () => {
            const userId = 'user1';
            const amount = 1000;
            const wallet = { id: 'w1', userId, balance: new Decimal(1050), transactions: [] };
            const method = { id: 'm1', userId, isDefault: true, isInstantCapable: true, type: 'DEBIT_CARD' };

            mockPrisma.wallet.findUnique.mockResolvedValue(wallet);
            mockPrisma.withdrawalMethod.findFirst.mockResolvedValue(method);

            await service.withdraw(userId, amount, true);

            // Fee = 1000 * 0.015 = 15. Total deduction = 1015
            expect(mockPrisma.wallet.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: wallet.id },
                data: { balance: { decrement: 1015 } }
            }));

            expect(mockPrisma.transaction.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    feeAmount: 15,
                    status: 'INSTANT_PROCESSED'
                })
            }));
        });

        it('should enforce minimum $2.00 fee for instant withdrawal', async () => {
            const userId = 'user1';
            const amount = 50; // 1.5% of 50 is 0.75, which is < 2.00
            const wallet = { id: 'w1', userId, balance: new Decimal(100), transactions: [] };
            const method = { id: 'm1', userId, isDefault: true, isInstantCapable: true, type: 'DEBIT_CARD' };

            mockPrisma.wallet.findUnique.mockResolvedValue(wallet);
            mockPrisma.withdrawalMethod.findFirst.mockResolvedValue(method);

            await service.withdraw(userId, amount, true);

            expect(mockPrisma.wallet.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: wallet.id },
                data: { balance: { decrement: 52 } } // 50 + 2.00
            }));
        });
    });
});
