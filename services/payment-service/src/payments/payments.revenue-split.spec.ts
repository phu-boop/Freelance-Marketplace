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

describe('PaymentsService - Revenue Split', () => {
    let service: PaymentsService;
    let prisma: PrismaService;
    let httpService: HttpService;

    const mockPrisma = {
        escrowHold: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
        },
        wallet: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        transaction: {
            create: jest.fn(),
        },
        $transaction: jest.fn((cb) => cb(mockPrisma)),
    };

    const mockHttp = {
        get: jest.fn(),
        post: jest.fn(),
    };

    const mockConfig = {
        get: jest.fn((key) => {
            if (key === 'CONTRACT_SERVICE_URL') return 'http://contract-service';
            return null;
        }),
    };

    const mockCurrency = {
        getExchangeRates: jest.fn(),
        convert: jest.fn(),
    };

    const mockRegional = {};
    const mockTax = {
        calculateTax: jest.fn().mockResolvedValue(new Decimal(0)),
        // add other methods if needed
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
        jest.spyOn(service as any, 'logFinancialEvent').mockImplementation(() => of(null));
        prisma = module.get<PrismaService>(PrismaService);
        httpService = module.get<HttpService>(HttpService);
    });

    it('should split revenue correctly between freelancer and agency', async () => {
        const contractId = 'cont1';
        const milestoneId = 'mile1';
        const freelancerId = 'free1';
        const agencyId = 'agency1';
        const holdId = 'hold1';
        const totalAmount = new Decimal(100);
        const agencySplitPercentage = 20; // 20%

        const mockHold = {
            id: holdId,
            amount: totalAmount,
            status: 'ACTIVE',
            costCenter: 'PROJECT',
        };

        const mockContract = {
            id: contractId,
            agencyId: agencyId,
            agencyRevenueSplit: agencySplitPercentage,
            status: 'ACTIVE',
        };

        mockPrisma.escrowHold.findFirst.mockResolvedValue(mockHold);
        mockHttp.get.mockReturnValue(of({ data: mockContract }));

        // Mock getWallet for freelancer and agency
        const freelancerWallet = { id: 'w-free', userId: freelancerId, balance: new Decimal(0), transactions: [] };
        const agencyWallet = { id: 'w-agency', userId: agencyId, balance: new Decimal(0), transactions: [] };

        // We need to mock getWallet internal call. 
        // In payments.service.ts, getWallet uses this.prisma.wallet.findUnique
        mockPrisma.wallet.findUnique.mockImplementation(({ where }) => {
            if (where.userId === freelancerId) return Promise.resolve(freelancerWallet);
            if (where.userId === agencyId) return Promise.resolve(agencyWallet);
            return Promise.resolve(null);
        });

        mockPrisma.transaction.create.mockImplementation(({ data }) => Promise.resolve({ id: 'tx-123', ...data }));

        await service.releaseEscrow(contractId, milestoneId, freelancerId);

        // Expected amounts
        const expectedAgencyAmount = new Decimal(20); // 100 * 20 / 100
        const expectedFreelancerAmount = new Decimal(80); // 100 - 20

        // Verify agency wallet update
        expect(mockPrisma.wallet.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: agencyWallet.id },
            data: { balance: { increment: expectedAgencyAmount } }
        }));

        // Verify freelancer wallet update
        expect(mockPrisma.wallet.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: freelancerWallet.id },
            data: { balance: { increment: expectedFreelancerAmount } }
        }));

        // Verify agency transaction creation
        expect(mockPrisma.transaction.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                walletId: agencyWallet.id,
                amount: expectedAgencyAmount,
                type: 'AGENCY_REVENUE_SHARE'
            })
        }));
    });
});
