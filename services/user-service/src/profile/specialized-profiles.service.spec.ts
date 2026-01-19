import { Test, TestingModule } from '@nestjs/testing';
import { SpecializedProfilesService } from './specialized-profiles.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('SpecializedProfilesService', () => {
    let service: SpecializedProfilesService;
    let prisma: PrismaService;

    const mockPrismaService = {
        specializedProfile: {
            count: jest.fn(),
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
            delete: jest.fn(),
        },
        portfolioItem: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        experience: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        education: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        certification: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SpecializedProfilesService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<SpecializedProfilesService>(SpecializedProfilesService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should throw BadRequestException if user already has 3 profiles', async () => {
            mockPrismaService.specializedProfile.count.mockResolvedValue(3);
            await expect(service.create('user1', {} as any)).rejects.toThrow(BadRequestException);
        });

        it('should create a new profile', async () => {
            mockPrismaService.specializedProfile.count.mockResolvedValue(1);
            const dto = { headline: 'Test', isDefault: false };
            mockPrismaService.specializedProfile.create.mockResolvedValue({ id: 'prof1', ...dto });

            const result = await service.create('user1', dto as any);
            expect(result.id).toBe('prof1');
            expect(mockPrismaService.specializedProfile.create).toHaveBeenCalled();
        });

        it('should reset other defaults if new profile is default', async () => {
            mockPrismaService.specializedProfile.count.mockResolvedValue(1);
            const dto = { headline: 'Test', isDefault: true };
            mockPrismaService.specializedProfile.create.mockResolvedValue({ id: 'prof1', ...dto });

            await service.create('user1', dto as any);
            expect(mockPrismaService.specializedProfile.updateMany).toHaveBeenCalledWith({
                where: { userId: 'user1', isDefault: true },
                data: { isDefault: false },
            });
        });
    });

    describe('findOne', () => {
        it('should return a profile if it exists and belongs to user', async () => {
            const profile = { id: 'prof1', userId: 'user1' };
            mockPrismaService.specializedProfile.findUnique.mockResolvedValue(profile);

            const result = await service.findOne('user1', 'prof1');
            expect(result).toEqual(profile);
        });

        it('should throw NotFoundException if profile does not exist', async () => {
            mockPrismaService.specializedProfile.findUnique.mockResolvedValue(null);
            await expect(service.findOne('user1', 'prof1')).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException if profile belongs to another user', async () => {
            mockPrismaService.specializedProfile.findUnique.mockResolvedValue({ id: 'prof1', userId: 'user2' });
            await expect(service.findOne('user1', 'prof1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('linkPortfolioItem', () => {
        it('should link a portfolio item to a profile', async () => {
            const profile = { id: 'prof1', userId: 'user1' };
            const item = { id: 'item1', userId: 'user1' };
            mockPrismaService.specializedProfile.findUnique.mockResolvedValue(profile);
            mockPrismaService.portfolioItem.findUnique.mockResolvedValue(item);
            mockPrismaService.portfolioItem.update.mockResolvedValue({ ...item, specializedProfileId: 'prof1' });

            const result = await service.linkPortfolioItem('user1', 'prof1', 'item1');
            expect(result.specializedProfileId).toBe('prof1');
        });

        it('should throw NotFoundException if portfolio item belongs to another user', async () => {
            const profile = { id: 'prof1', userId: 'user1' };
            const item = { id: 'item1', userId: 'user2' };
            mockPrismaService.specializedProfile.findUnique.mockResolvedValue(profile);
            mockPrismaService.portfolioItem.findUnique.mockResolvedValue(item);

            await expect(service.linkPortfolioItem('user1', 'prof1', 'item1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('Linking Other items', () => {
        const profile = { id: 'prof1', userId: 'user1' };

        beforeEach(() => {
            mockPrismaService.specializedProfile.findUnique.mockResolvedValue(profile);
        });

        it('should link an experience', async () => {
            const exp = { id: 'exp1', userId: 'user1' };
            mockPrismaService.experience.findUnique.mockResolvedValue(exp);
            mockPrismaService.experience.update.mockResolvedValue({ ...exp, specializedProfileId: 'prof1' });

            const result = await service.linkExperience('user1', 'prof1', 'exp1');
            expect(result.specializedProfileId).toBe('prof1');
        });

        it('should link an education', async () => {
            const edu = { id: 'edu1', userId: 'user1' };
            mockPrismaService.education.findUnique.mockResolvedValue(edu);
            mockPrismaService.education.update.mockResolvedValue({ ...edu, specializedProfileId: 'prof1' });

            const result = await service.linkEducation('user1', 'prof1', 'edu1');
            expect(result.specializedProfileId).toBe('prof1');
        });

        it('should link a certification', async () => {
            const cert = { id: 'cert1', userId: 'user1' };
            mockPrismaService.certification.findUnique.mockResolvedValue(cert);
            mockPrismaService.certification.update.mockResolvedValue({ ...cert, specializedProfileId: 'prof1' });

            const result = await service.linkCertification('user1', 'prof1', 'cert1');
            expect(result.specializedProfileId).toBe('prof1');
        });

        it('should unlink an item', async () => {
            const exp = { id: 'exp1', userId: 'user1', specializedProfileId: 'prof1' };
            mockPrismaService.experience.findUnique.mockResolvedValue(exp);
            mockPrismaService.experience.update.mockResolvedValue({ ...exp, specializedProfileId: null });

            const result = await service.unlinkItem('user1', 'experience', 'exp1');
            expect(result.specializedProfileId).toBeNull();
        });
    });
});
