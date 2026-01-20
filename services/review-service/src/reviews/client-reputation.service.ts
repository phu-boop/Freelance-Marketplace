import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ClientReputation {
    clientId: string;
    totalSpend: number;
    hiringRate: number; // percentage 0-100
    avgHourlyRate: number;
    reviewsCount: number;
    avgRating: number;
    spendTier: 'NONE' | 'GOLD' | 'PLATINUM' | 'ENTERPRISE';
}

@Injectable()
export class ClientReputationService {
    private readonly logger = new Logger(ClientReputationService.name);

    constructor(private prisma: PrismaService) { }

    async calculateClientScore(clientId: string): Promise<ClientReputation> {
        this.logger.log(`Calculating reputation for client: ${clientId}`);

        const stats = await this.prisma.review.aggregate({
            where: { reviewee_id: clientId },
            _avg: { ratingOverall: true },
            _sum: { contractValue: true },
            _count: { id: true }
        });

        const totalSpend = stats._sum.contractValue ? Number(stats._sum.contractValue) : 0;
        const avgRating = stats._avg.ratingOverall || 0;
        const reviewsCount = stats._count.id;

        // Hiring Rate still requires cross-service call to JobService (jobs filled / posted)
        // For now we keep it as a placeholder or fetch if available.
        const hiringRate = 85;
        const avgHourlyRate = 45.0; // Placeholder

        return {
            clientId,
            totalSpend,
            hiringRate,
            avgHourlyRate,
            reviewsCount,
            avgRating: Number(avgRating.toFixed(1)),
            spendTier: this.calculateTier(totalSpend)
        };
    }

    private calculateTier(spend: number): ClientReputation['spendTier'] {
        if (spend > 1000000) return 'ENTERPRISE';
        if (spend > 100000) return 'PLATINUM';
        if (spend > 10000) return 'GOLD';
        return 'NONE';
    }
}
