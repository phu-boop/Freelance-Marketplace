import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface WorkDiarySegment {
    id: string;
    contractId: string;
    timestamp: Date;
    screenshotUrl: string;
    activityScore: number; // 0-100
    memo: string;
    keystrokes: number;
    mouseClicks: number;
    status: 'PENDING' | 'APPROVED' | 'DISPUTED';
}

@Injectable()
export class WorkDiaryService {
    private readonly logger = new Logger(WorkDiaryService.name);

    constructor(private prisma: PrismaService) { }

    async logSegment(contractId: string, data: Omit<WorkDiarySegment, 'id' | 'status' | 'timestamp'>) {
        this.logger.log(`Logging work diary segment for contract ${contractId}`);

        const segment = await this.prisma.workDiarySegment.create({
            data: {
                contractId,
                timestamp: new Date(),
                status: 'PENDING',
                screenshotUrl: data.screenshotUrl,
                activityScore: data.activityScore,
                memo: data.memo,
                keystrokes: data.keystrokes,
                mouseClicks: data.mouseClicks
            }
        });

        return segment; // Returns the Prisma object which matches the shape
    }

    async getSegments(contractId: string) {
        return this.prisma.workDiarySegment.findMany({
            where: { contractId },
            orderBy: { timestamp: 'desc' }
        });
    }

    async disputeSegment(segmentId: string, reason: string) {
        this.logger.log(`Disputing segment ${segmentId}: ${reason}`);

        try {
            return await this.prisma.workDiarySegment.update({
                where: { id: segmentId },
                data: { status: 'DISPUTED' } // We could also store the reason if we added a field for it
            });
        } catch (error) {
            this.logger.error(`Failed to dispute segment ${segmentId}`, error);
            throw error;
        }
    }
}
