import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto, CreateLessonDto } from './academy.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AcademyService {
    private readonly logger = new Logger(AcademyService.name);

    constructor(
        private prisma: PrismaService,
        private httpService: HttpService,
        private configService: ConfigService,
    ) { }

    async createCourse(dto: CreateCourseDto) {
        return this.prisma.course.create({ data: dto });
    }

    async addLesson(courseId: string, dto: CreateLessonDto) {
        const course = await this.prisma.course.findUnique({ where: { id: courseId } });
        if (!course) throw new NotFoundException('Course not found');
        return this.prisma.lesson.create({ data: { ...dto, courseId } });
    }

    async getCourses() {
        return this.prisma.course.findMany({
            include: { _count: { select: { lessons: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getCourse(id: string) {
        const course = await this.prisma.course.findUnique({
            where: { id },
            include: { lessons: { orderBy: { order: 'asc' } } },
        });
        if (!course) throw new NotFoundException('Course not found');
        return course;
    }

    async completeCourse(userId: string, courseId: string) {
        const course = await this.prisma.course.findUnique({ where: { id: courseId } });
        if (!course) throw new NotFoundException('Course not found');

        // Check if already certified
        const existing = await this.prisma.certification.findUnique({
            where: { userId_courseId: { userId, courseId } }
        });

        if (existing) return existing;

        const cert = await this.prisma.certification.create({
            data: { userId, courseId }
        });

        // Sync with User Service to award badge if applicable
        if (course.badgeName) {
            try {
                const userServiceUrl = this.configService.get<string>(
                    'USER_SERVICE_INTERNAL_URL',
                    'http://user-service:3000/api/users',
                );
                await firstValueFrom(
                    this.httpService.post(`${userServiceUrl}/${userId}/badges/award`, {
                        badgeName: course.badgeName,
                        reason: `Completed course: ${course.title}`
                    })
                );
            } catch (error) {
                this.logger.error(`Failed to award badge ${course.badgeName} to user ${userId}: ${error.message}`);
            }
        }

        return cert;
    }

    async getMyCertifications(userId: string) {
        return this.prisma.certification.findMany({
            where: { userId },
            include: { course: true },
        });
    }
}
