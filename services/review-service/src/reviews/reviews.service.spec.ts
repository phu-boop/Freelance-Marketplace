import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

describe('ReviewsService', () => {
    let service: ReviewsService;
    let prisma: PrismaService;

    const mockPrisma = {
        review: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    };

    const mockHttpService = {};
    const mockConfigService = {
        get: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReviewsService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: HttpService, useValue: mockHttpService },
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        service = module.get<ReviewsService>(ReviewsService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('addReply', () => {
        const reviewId = 'review-1';
        const userId = 'user-reviewee';
        const replyText = 'Thank you!';

        it('should successfully add a reply if the user is the reviewee', async () => {
            mockPrisma.review.findUnique.mockResolvedValue({
                id: reviewId,
                reviewee_id: userId,
            });

            mockPrisma.review.update.mockResolvedValue({
                id: reviewId,
                reply: replyText,
                repliedAt: new Date(),
            });

            const result = await service.addReply(reviewId, replyText, userId);

            expect(prisma.review.findUnique).toHaveBeenCalledWith({ where: { id: reviewId } });
            expect(prisma.review.update).toHaveBeenCalledWith({
                where: { id: reviewId },
                data: expect.objectContaining({
                    reply: replyText,
                    repliedAt: expect.any(Date),
                }),
            });
            expect(result.reply).toBe(replyText);
        });

        it('should throw an error if the review is not found', async () => {
            mockPrisma.review.findUnique.mockResolvedValue(null);

            await expect(service.addReply(reviewId, replyText, userId))
                .rejects.toThrow('Review not found');
        });

        it('should throw an error if the user is not the reviewee', async () => {
            mockPrisma.review.findUnique.mockResolvedValue({
                id: reviewId,
                reviewee_id: 'different-user',
            });

            await expect(service.addReply(reviewId, replyText, userId))
                .rejects.toThrow('You can only reply to reviews received by you');
        });
    });
});
