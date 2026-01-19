import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CurrencyConverterService } from './currency-converter.service';
import { RegionalGatewayService } from './regional-gateway.service';
import { TaxCalculationService } from './tax-calculation.service';
import { NotFoundException } from '@nestjs/common';
import { of } from 'rxjs';
import { Decimal } from '@prisma/client/runtime/library';

const mockTaxCalculationService = {
  calculateTax: jest.fn().mockResolvedValue(new Decimal(0)),
};

const mockRegionalGatewayService = {
  processRegionalPayout: jest.fn().mockResolvedValue({ success: true }),
};

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: PrismaService;

  const mockPrisma = {
    transaction: {
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    wallet: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    withdrawalMethod: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn((input) => {
      if (Array.isArray(input)) return Promise.all(input);
      return input(mockPrisma);
    }),
  };

  const mockHttp = {
    get: jest.fn(),
    post: jest.fn().mockReturnValue(of({ data: {} })),
  };

  const mockConfig = {
    get: jest.fn((key, defaultValue) => defaultValue),
  };

  const mockCurrency = {
    getExchangeRates: jest.fn().mockResolvedValue({ USD: 1.0 }),
    convert: jest.fn().mockResolvedValue(100),
  };

  const mockRegional = {
    processRegionalPayout: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: HttpService, useValue: mockHttp },
        { provide: ConfigService, useValue: mockConfig },
        { provide: CurrencyConverterService, useValue: mockCurrency },
        { provide: RegionalGatewayService, useValue: mockRegionalGatewayService },
        { provide: TaxCalculationService, useValue: mockTaxCalculationService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('getTransactionById', () => {
    it('should return a transaction if owner matches', async () => {
      const mockTx = { id: 'tx1', wallet: { userId: 'user1' } };
      mockPrisma.transaction.findUnique.mockResolvedValue(mockTx);

      const result = await service.getTransactionById('tx1', 'user1', false);
      expect(result).toEqual(mockTx);
    });

    it('should throw NotFoundException if owner does not match', async () => {
      const mockTx = { id: 'tx1', wallet: { userId: 'user2' } };
      mockPrisma.transaction.findUnique.mockResolvedValue(mockTx);

      await expect(
        service.getTransactionById('tx1', 'user1', false),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return a transaction for admin even if owner does not match', async () => {
      const mockTx = { id: 'tx1', wallet: { userId: 'user2' } };
      mockPrisma.transaction.findUnique.mockResolvedValue(mockTx);

      const result = await service.getTransactionById('tx1', 'user1', true);
      expect(result).toEqual(mockTx);
    });

    it('should throw NotFoundException if transaction not found', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue(null);

      await expect(
        service.getTransactionById('tx1', 'user1', false),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTransactionStatus', () => {
    it('should update status and log financial event', async () => {
      const mockTx = { id: 'tx1', amount: 100, status: 'PENDING' };
      const adminId = 'admin-123';

      mockPrisma.transaction.findUnique.mockResolvedValue(mockTx);
      mockPrisma.transaction.update.mockResolvedValue({
        ...mockTx,
        status: 'COMPLETED',
      });

      // Spy on the private method logFinancialEvent
      const logSpy = jest
        .spyOn(service as any, 'logFinancialEvent')
        .mockResolvedValue(undefined);

      const result = await service.updateTransactionStatus(
        'tx1',
        'COMPLETED',
        adminId,
      );

      expect(result.status).toBe('COMPLETED');
      expect(mockPrisma.transaction.update).toHaveBeenCalledWith({
        where: { id: 'tx1' },
        data: { status: 'COMPLETED' },
      });
      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: adminId,
          eventType: 'TRANSACTION_STATUS_UPDATED',
          metadata: expect.objectContaining({
            previousStatus: 'PENDING',
            newStatus: 'COMPLETED',
          }),
        }),
      );
    });

    it('should throw NotFoundException if transaction does not exist', async () => {
      mockPrisma.transaction.findUnique.mockResolvedValue(null);
      await expect(
        service.updateTransactionStatus('non-existent', 'COMPLETED', 'admin'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listTransactions', () => {
    it('should filter by userId if provided', async () => {
      mockPrisma.transaction.count.mockResolvedValue(10);
      mockPrisma.transaction.findMany.mockResolvedValue([]);

      await service.listTransactions('user1', { limit: 10, offset: 0 });

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            wallet: { userId: 'user1' },
          }),
        }),
      );
    });

    it('should not filter by userId if not provided (admin view)', async () => {
      mockPrisma.transaction.count.mockResolvedValue(10);
      mockPrisma.transaction.findMany.mockResolvedValue([]);

      await service.listTransactions(undefined, { limit: 10, offset: 0 });

      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });
  });
});
