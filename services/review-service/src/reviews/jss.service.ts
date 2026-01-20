import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Decimal from 'decimal.js';

@Injectable()
export class JssService {
    private readonly logger = new Logger(JssService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Calculate JSS for a freelancer
     * Formula: 
     * JSS = (WeightedSum of (Score * ContractWeight * RecencyWeight)) / (Sum of (ContractWeight * RecencyWeight))
     * Score = (PublicRating/5 * 0.2) + (PrivateRating/10 * 0.8)
     */
    async calculateJss(userId: string): Promise<number> {
        const reviews = await this.prisma.review.findMany({
            where: {
                reviewee_id: userId,
                status: 'RELEASED' as any,
            },
        });

        if (reviews.length === 0) return 100; // Default for new freelancers

        let totalWeightedScore = new Decimal(0);
        let totalWeight = new Decimal(0);

        // Track repeat clients
        const clientProjects = new Map<string, number>();

        for (const review of reviews) {
            // 1. Calculate base score (0 to 1)
            const publicScore = review.ratingOverall / 5;
            const privateScore = (review.privateRating || review.ratingOverall * 2) / 10; // Fallback to public if private missing
            const baseScore = (publicScore * 0.2) + (privateScore * 0.8);

            // 2. Weight by contract value (logarithmic to prevent outliers from dominating too much)
            // min weight 1.0, max weight starts scaling after $500
            const value = new Decimal(review.contractValue.toString() || '0');
            const contractWeight = value.gt(100)
                ? Decimal.log10(value.plus(1))
                : new Decimal(1);

            // 3. Recency Decay
            const monthsOld = (Date.now() - review.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
            const recencyWeight = monthsOld > 6 ? 0.5 : 1.0;

            const finalWeight = contractWeight.mul(recencyWeight);

            totalWeightedScore = totalWeightedScore.plus(finalWeight.mul(baseScore));
            totalWeight = totalWeight.plus(finalWeight);

            // Track clients for bonus
            clientProjects.set(review.reviewer_id, (clientProjects.get(review.reviewer_id) || 0) + 1);
        }

        if (totalWeight.isZero()) return 100;

        let jss = totalWeightedScore.div(totalWeight).mul(100).toNumber();

        // 4. Repeat Client Bonus (+1% per repeat client, max +5%)
        let repeatBonus = 0;
        clientProjects.forEach((count) => {
            if (count > 1) repeatBonus += 1;
        });
        jss += Math.min(repeatBonus, 5);

        return Math.min(Math.round(jss), 100);
    }
}
