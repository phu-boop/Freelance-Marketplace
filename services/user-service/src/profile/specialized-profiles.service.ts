import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSpecializedProfileDto } from './dto/create-specialized-profile.dto';

@Injectable()
export class SpecializedProfilesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(userId: string, dto: CreateSpecializedProfileDto) {
        const count = await (this.prisma as any).specializedProfile.count({
            where: { userId },
        });

        if (count >= 3) {
            throw new BadRequestException('You can only have up to 3 specialized profiles');
        }

        if (dto.isDefault) {
            await (this.prisma as any).specializedProfile.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        return (this.prisma as any).specializedProfile.create({
            data: {
                ...dto,
                userId,
            },
        });
    }

    async findAll(userId: string) {
        return (this.prisma as any).specializedProfile.findMany({
            where: { userId },
            include: {
                portfolioItems: true,
                education: true,
                experience: true,
                certifications: true,
            },
        });
    }

    async findOne(userId: string, id: string) {
        const profile = await (this.prisma as any).specializedProfile.findUnique({
            where: { id },
            include: {
                portfolioItems: true,
                education: true,
                experience: true,
                certifications: true,
            },
        });

        if (!profile || profile.userId !== userId) {
            throw new NotFoundException('Specialized profile not found');
        }

        return profile;
    }

    async update(userId: string, id: string, dto: Partial<CreateSpecializedProfileDto>) {
        const profile = await this.findOne(userId, id);

        if (dto.isDefault) {
            await (this.prisma as any).specializedProfile.updateMany({
                where: { userId, isDefault: true },
                data: { isDefault: false },
            });
        }

        return (this.prisma as any).specializedProfile.update({
            where: { id },
            data: dto,
        });
    }

    async remove(userId: string, id: string) {
        const profile = await this.findOne(userId, id);
        return (this.prisma as any).specializedProfile.delete({
            where: { id },
        });
    }

    async linkPortfolioItem(userId: string, profileId: string, portfolioItemId: string) {
        await this.findOne(userId, profileId);

        const item = await this.prisma.portfolioItem.findUnique({
            where: { id: portfolioItemId },
        });

        if (!item || item.userId !== userId) {
            throw new NotFoundException('Portfolio item not found');
        }

        return (this.prisma.portfolioItem as any).update({
            where: { id: portfolioItemId },
            data: { specializedProfileId: profileId },
        });
    }

    async linkExperience(userId: string, profileId: string, experienceId: string) {
        await this.findOne(userId, profileId);
        const exp = await (this.prisma as any).experience.findUnique({ where: { id: experienceId } });
        if (!exp || exp.userId !== userId) throw new NotFoundException('Experience not found');

        return (this.prisma as any).experience.update({
            where: { id: experienceId },
            data: { specializedProfileId: profileId },
        });
    }

    async linkEducation(userId: string, profileId: string, educationId: string) {
        await this.findOne(userId, profileId);
        const edu = await (this.prisma as any).education.findUnique({ where: { id: educationId } });
        if (!edu || edu.userId !== userId) throw new NotFoundException('Education not found');

        return (this.prisma as any).education.update({
            where: { id: educationId },
            data: { specializedProfileId: profileId },
        });
    }

    async linkCertification(userId: string, profileId: string, certificationId: string) {
        await this.findOne(userId, profileId);
        const cert = await (this.prisma as any).certification.findUnique({ where: { id: certificationId } });
        if (!cert || cert.userId !== userId) throw new NotFoundException('Certification not found');

        return (this.prisma as any).certification.update({
            where: { id: certificationId },
            data: { specializedProfileId: profileId },
        });
    }

    async unlinkItem(userId: string, type: 'portfolio' | 'experience' | 'education' | 'certification', itemId: string) {
        const model = type === 'portfolio' ? 'portfolioItem' : type;
        const item = await (this.prisma as any)[model].findUnique({ where: { id: itemId } });
        if (!item || item.userId !== userId) throw new NotFoundException(`${type} not found`);

        return (this.prisma as any)[model].update({
            where: { id: itemId },
            data: { specializedProfileId: null },
        });
    }
}
