import { Test, TestingModule } from '@nestjs/testing';
import { BadgesService } from './badges.service';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';

describe('BadgesService', () => {
    let service: BadgesService;
    let prisma: PrismaService;

    const mockPrisma = {
        user: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        badge: {
            create: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BadgesService,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        service = module.get<BadgesService>(BadgesService);
        prisma = module.get<PrismaService>(PrismaService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('checkEligibility', () => {
        it('should award TOP_RATED badge if conditions are met', async () => {
            const user = {
                id: 'user1',
                rating: 4.9,
                reviewCount: 15,
                jobSuccessScore: 95,
                isIdentityVerified: true,
                trustScore: 90,
                awardedBadges: [],
                certifications: [],
                kycStatus: 'COMPLETED',
                isPaymentVerified: false,
            };
            mockPrisma.user.findUnique.mockResolvedValue(user);

            await service.checkEligibility('user1');

            expect(mockPrisma.badge.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ name: 'TOP_RATED' }),
            }));
        });

        it('should award IDENTITY_VERIFIED badge if identity is verified', async () => {
            const user = {
                id: 'user1',
                rating: 0,
                reviewCount: 0,
                jobSuccessScore: 0,
                isIdentityVerified: true,
                trustScore: 0,
                awardedBadges: [],
                certifications: [],
                kycStatus: 'COMPLETED',
                isPaymentVerified: false,
            };
            mockPrisma.user.findUnique.mockResolvedValue(user);

            await service.checkEligibility('user1');

            expect(mockPrisma.badge.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ name: 'IDENTITY_VERIFIED' }),
            }));
        });

        it('should not award badge if already exists', async () => {
            const user = {
                id: 'user1',
                rating: 4.9,
                reviewCount: 15,
                jobSuccessScore: 95,
                awardedBadges: [{ name: 'TOP_RATED' }],
                certifications: [],
                kycStatus: 'NOT_STARTED',
                isPaymentVerified: false,
            };
            mockPrisma.user.findUnique.mockResolvedValue(user);

            await service.checkEligibility('user1');

            // Should NOT call create for TOP_RATED again
            expect(mockPrisma.badge.create).not.toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ name: 'TOP_RATED' }),
            }));
        });
    });
});
