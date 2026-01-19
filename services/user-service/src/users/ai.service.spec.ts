import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('AiService', () => {
    let service: AiService;
    let configService: ConfigService;
    let httpService: HttpService;

    const mockPrisma = {
        portfolioItem: {
            findFirst: jest.fn(),
            create: jest.fn(),
        },
        skillAssessment: {
            create: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
        },
    };

    const mockHttp = {
        get: jest.fn(),
    };

    const mockConfig = {
        get: jest.fn((key) => {
            if (key === 'GEMINI_API_KEY') return null; // Force mock mode
            return 'http://mock-service';
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: HttpService, useValue: mockHttp },
                { provide: ConfigService, useValue: mockConfig },
            ],
        }).compile();

        service = module.get<AiService>(AiService);
        configService = module.get<ConfigService>(ConfigService);
        httpService = module.get<HttpService>(HttpService);
    });

    describe('verifyPortfolio', () => {
        it('should return mock verification if Gemini is disabled', async () => {
            const result = await service.verifyPortfolio('user1', 'http://portfolio.com');
            expect(result.isVerified).toBe(true);
            expect(result.confidence).toBeGreaterThan(0.9);
            expect(result.tags).toContain('React');
        });
    });

    describe('generatePortfolioItem', () => {
        it('should return existing item if found', async () => {
            const existing = { id: 'p1', title: 'Old' };
            mockPrisma.portfolioItem.findFirst.mockResolvedValue(existing);

            const result = await service.generatePortfolioItem('user1', 'cont1');
            expect(result).toEqual(existing);
        });

        it('should generate a mock portfolio item', async () => {
            mockPrisma.portfolioItem.findFirst.mockResolvedValue(null);
            mockHttp.get.mockReturnValue(of({ data: { id: 'cont1', job_id: 'job1', totalAmount: 1000 } }));
            mockPrisma.portfolioItem.create.mockImplementation(({ data }) => Promise.resolve({ id: 'new-p', ...data }));

            const result = await service.generatePortfolioItem('user1', 'cont1');
            expect(result.title).toContain('Completed');
            expect(result.source).toBe('AI_GENERATED');
        });
    });
});
