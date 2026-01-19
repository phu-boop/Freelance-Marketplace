import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BadgesService {
  private readonly logger = new Logger(BadgesService.name);

  constructor(private prisma: PrismaService) {}

  async checkEligibility(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { awardedBadges: true, certifications: true },
    });

    if (!user) return;

    // 1. Check Top Rated
    // Rules: JSS >= 90%, Earnings > $1000 (mock), Identity Verified
    const hasTopRated = user.awardedBadges.some((b) => b.name === 'TOP_RATED');
    if (!hasTopRated) {
      if (
        user.jobSuccessScore >= 90 &&
        user.isIdentityVerified &&
        user.trustScore > 80
      ) {
        await this.awardBadge(userId, 'TOP_RATED');
      }
    }

    // 2. Check Rising Talent
    // Rules: No JSS yet (or high), Complete profile, New account (< 6 months)
    const hasRisingTalent = user.awardedBadges.some(
      (b) => b.name === 'RISING_TALENT',
    );
    if (!hasRisingTalent && !hasTopRated) {
      const accountAgeDays =
        (Date.now() - new Date(user.createdAt).getTime()) /
        (1000 * 60 * 60 * 24);
      if (
        accountAgeDays < 180 &&
        user.completionPercentage >= 80 &&
        user.trustScore > 80
      ) {
        await this.awardBadge(userId, 'RISING_TALENT');
      }
    }

    // 3. Check Expert Vetted (Manual/Mock)
    // 4. Simple Verification Status Badges
    const simpleBadges = [
      { name: 'IDENTITY_VERIFIED', condition: user.isIdentityVerified },
      { name: 'PAYMENT_VERIFIED', condition: user.isPaymentVerified },
      {
        name: 'SKILL_VERIFIED',
        condition:
          user.certifications &&
          user.certifications.some((c: any) => c.status === 'VERIFIED'),
      },
    ];

    for (const badge of simpleBadges) {
      if (badge.condition) {
        const hasBadge = user.awardedBadges.some((b) => b.name === badge.name);
        if (!hasBadge) {
          await this.awardBadge(userId, badge.name);
        }
      }
    }
  }

  async awardBadge(userId: string, badgeName: string) {
    const badgeSlug = badgeName.toLowerCase().replace('_', '-');
    await this.prisma.badge.create({
      data: {
        userId,
        name: badgeName,
        slug: badgeSlug,
        metadata: { source: 'AUTOMATED_RULES_ENGINE' },
      },
    });
    this.logger.log(`Awarded badge ${badgeName} to user ${userId}`);

    // Sync to user.badges generic array for backward compatibility if needed
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        badges: { push: badgeName },
      },
    });
  }

  async getBadges(userId: string) {
    return this.prisma.badge.findMany({ where: { userId } });
  }
}
