import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class VettingService {
    private readonly logger = new Logger(VettingService.name);

    constructor(
        private prisma: PrismaService,
        private aiService: AiService,
    ) { }

    async startSkillAssessment(userId: string, skillName: string) {
        // Generate questions using AI
        const questions = await this.aiService.generateSkillAssessment(skillName);

        const assessment = await this.prisma.skillAssessment.create({
            data: {
                userId,
                skillName,
                questions: questions as any,
                status: 'PENDING',
            },
        });

        return assessment;
    }

    async getAssessment(id: string, userId: string) {
        const assessment = await this.prisma.skillAssessment.findUnique({
            where: { id },
        });

        if (!assessment) throw new NotFoundException('Assessment not found');
        if (assessment.userId !== userId) throw new BadRequestException('Unauthorized');

        return assessment;
    }

    async submitAssessment(assessmentId: string, userId: string, answers: Record<number, number>) {
        const assessment = await this.prisma.skillAssessment.findUnique({
            where: { id: assessmentId },
        });

        if (!assessment) throw new NotFoundException('Assessment not found');
        if (assessment.userId !== userId) throw new BadRequestException('Unauthorized');
        if (assessment.status !== 'PENDING') throw new BadRequestException('Assessment already completed');

        const questions = assessment.questions as any[];
        let correctCount = 0;

        questions.forEach((q, idx) => {
            if (answers[idx] === q.correctIndex) {
                correctCount++;
            }
        });

        const score = Math.round((correctCount / questions.length) * 100);
        const status = score >= 70 ? 'COMPLETED' : 'FAILED';

        const updatedAssessment = await this.prisma.skillAssessment.update({
            where: { id: assessmentId },
            data: {
                answers: answers as any,
                score,
                status,
                verifiedAt: status === 'COMPLETED' ? new Date() : null,
            },
        });

        // If completed, maybe award a badge or update skills data
        if (status === 'COMPLETED') {
            this.logger.log(`User ${userId} passed assessment for ${assessment.skillName} with score ${score}`);
        }

        return updatedAssessment;
    }

    async addCertification(userId: string, data: any) {
        return this.prisma.certification.create({
            data: {
                ...data,
                userId,
                status: 'PENDING',
            },
        });
    }

    async verifyCertification(certificationId: string) {
        // Mock verification logic
        return this.prisma.certification.update({
            where: { id: certificationId },
            data: {
                status: 'VERIFIED',
                verifiedAt: new Date(),
            },
        });
    }

    async approveExpertVetting(userId: string) {
        return this.prisma.badge.upsert({
            where: { userId_name: { userId, name: 'Expert-Vetted' } },
            update: { awardedAt: new Date() },
            create: {
                userId,
                name: 'Expert-Vetted',
                slug: 'expert-vetted',
                metadata: { vourchedBy: 'System Admin' },
            },
        });
    }
}
