import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class ReferralsService {
    private readonly logger = new Logger(ReferralsService.name);

    constructor(private readonly prisma: PrismaService) { }

    async generateReferralCode(userId: string) {
        // Check if user already has a code
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { referralCode: true, id: true }
        });

        if (user?.referralCode) {
            return { code: user.referralCode, userId: user.id };
        }

        // Generate new code
        const code = randomBytes(4).toString('hex').toUpperCase(); // e.g., 8AB2C1

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { referralCode: code },
            select: { referralCode: true, id: true }
        });

        return { code: updatedUser.referralCode, userId: updatedUser.id };
    }

    async validateCode(code: string) {
        const user = await this.prisma.user.findUnique({
            where: { referralCode: code },
            select: { id: true, firstName: true, lastName: true }
        });
        return user; // Returns the Referrer
    }

    async trackSignup(code: string, newUserId: string) {
        const referrer = await this.validateCode(code);
        if (!referrer) return null;

        if (referrer.id === newUserId) {
            this.logger.warn(`User ${newUserId} tried to refer themselves.`);
            return null;
        }

        // Create the Referral Record
        try {
            await this.prisma.referral.create({
                data: {
                    referrerId: referrer.id,
                    referredId: newUserId,
                    status: 'PENDING'
                }
            });

            this.logger.log(`User ${newUserId} successfully referred by ${referrer.id}`);
            return { success: true, referrerId: referrer.id };
        } catch (e) {
            this.logger.error(`Failed to track referral: ${e.message}`);
            return null;
        }
    }

    async getStats(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                referrals: true // Get all people referred by this user
            }
        });

        if (!user) return { code: null, totalInvites: 0, earnedConnects: 0 };

        const successfulReferrals = user.referrals.filter(r => r.status === 'COMPLETED').length;

        return {
            code: user.referralCode,
            totalInvites: user.referrals.length,
            earnedConnects: successfulReferrals * 50 // 50 connects per completed referral
        };
    }
}
