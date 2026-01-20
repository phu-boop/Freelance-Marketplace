import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface Course {
    id: string;
    title: string;
    description: string;
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    duration: string; // e.g. "2 hours"
    lessons: Lesson[];
    badgeId?: string;
}

export interface Lesson {
    id: string;
    title: string;
    content: string;
}

@Injectable()
export class AcademyService {
    private readonly logger = new Logger(AcademyService.name);

    constructor(private prisma: PrismaService) { }

    async listCourses() {
        return this.prisma.course.findMany({
            include: { lessons: true }
        });
    }

    async getCourse(courseId: string) {
        return this.prisma.course.findUnique({
            where: { id: courseId },
            include: { lessons: true }
        });
    }

    async enroll(userId: string, courseId: string) {
        this.logger.log(`User ${userId} enrolling in ${courseId}`);

        return this.prisma.enrollment.upsert({
            where: {
                userId_courseId: { userId, courseId }
            },
            create: {
                userId,
                courseId,
                status: 'IN_PROGRESS',
                progress: 0
            },
            update: {} // Idempotent
        });
    }

    async completeCourse(userId: string, courseId: string) {
        this.logger.log(`User ${userId} completed ${courseId}`);
        const course = await this.prisma.course.findUnique({ where: { id: courseId } });

        if (!course) {
            throw new Error('Course not found');
        }

        // Update Enrollment
        try {
            await this.prisma.enrollment.update({
                where: { userId_courseId: { userId, courseId } },
                data: { status: 'COMPLETED', completedAt: new Date(), progress: 100 }
            });
        } catch (e) {
            this.logger.warn(`Enrollment not found for completion, creating one...`);
            // Fallback if they completed without enrolling (edge case)
            await this.prisma.enrollment.create({
                data: { userId, courseId, status: 'COMPLETED', progress: 100, completedAt: new Date() }
            });
        }

        // Create Certification Record
        // Check if already certified
        const existingCert = await this.prisma.certification.findUnique({
            where: { userId_courseId: { userId, courseId } }
        });

        if (existingCert) {
            return {
                success: true,
                status: 'COMPLETED',
                certificationId: existingCert.id,
                awardedBadge: course.badgeId
            };
        }

        const cert = await this.prisma.certification.create({
            data: {
                userId,
                courseId,
                metadata: { awardedBadge: course.badgeId }
            }
        });

        if (course.badgeId) {
            this.logger.log(`Awarding badge ${course.badgeId} to ${userId}`);
            // Logic to call UserService to grant badge would go here
        }

        return {
            success: true,
            status: 'COMPLETED',
            certificationId: cert.id,
            awardedBadge: course.badgeId
        };
    }

    async getMyCertifications(userId: string) {
        return this.prisma.certification.findMany({
            where: { userId },
            include: { course: true }
        });
    }
}
