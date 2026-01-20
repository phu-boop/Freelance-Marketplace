import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GuardianService {
    private readonly logger = new Logger(GuardianService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { }

    async analyzeContent(content: string, userId: string): Promise<{ riskScore: number; flags: string[] }> {
        const flags: string[] = [];
        let riskScore = 0;

        // 1. Payment Keywords
        const paymentKeywords = ['paypal', 'wise', 'payoneer', 'crypto', 'usdc', 'usdt', 'btc', 'eth', 'wire transfer', 'western union'];
        if (paymentKeywords.some(keyword => content.toLowerCase().includes(keyword))) {
            flags.push('PAYMENT_KEYWORD_DETECTED');
            riskScore += 40;
        }

        // 2. Off-platform Communication
        const commKeywords = ['whatsapp', 'telegram', 'signal', 'skype', 'zoom', 'google meet', 'slack'];
        if (commKeywords.some(keyword => content.toLowerCase().includes(keyword))) {
            flags.push('OFF_PLATFORM_COMM_DETECTED');
            riskScore += 30;
        }

        // 3. Email Detection
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
        if (emailRegex.test(content)) {
            flags.push('EMAIL_DETECTED');
            riskScore += 30;
        }

        // 4. Phone Number Detection (Simplified international pattern)
        // Matches +(123) 456-7890, +1234567890, etc.
        const phoneRegex = /(\+|00)[1-9][0-9 \-\(\)\.]{7,32}/;
        if (phoneRegex.test(content)) {
            flags.push('PHONE_NUMBER_DETECTED');
            riskScore += 30;
        }

        // 5. "Pay Outside" intent
        const circumventionPhrases = ['pay outside', 'avoid fee', 'direct payment', 'lower fee', 'cancel contract'];
        if (circumventionPhrases.some(phrase => content.toLowerCase().includes(phrase))) {
            flags.push('CIRCUMVENTION_INTENT');
            riskScore += 80;
        }

        if (riskScore > 0) {
            this.logger.warn(`Guardian Flag for user ${userId}: Score ${riskScore}, Flags: ${flags.join(', ')}`);
        }

        // 6. AI-Powered Deep Scan
        try {
            const jobServiceUrl = this.configService.get<string>('JOB_SERVICE_URL', 'http://job-service:3002');
            const aiRes: any = await firstValueFrom(
                this.httpService.post(`${jobServiceUrl}/api/jobs/ai/scan-chat`, {
                    messages: [content]
                })
            );
            const { riskScore: aiScore, reason, isFlagged } = aiRes.data;

            if (isFlagged || aiScore > 50) {
                riskScore = Math.max(riskScore, aiScore);
                flags.push(`AI_FLAGGED: ${reason}`);
            }
        } catch (err) {
            this.logger.error(`AI Deep Scan failed: ${err.message}`);
        }

        if (riskScore > 0) {
            await this.reportRisk(userId, Math.min(riskScore, 100), flags);
        }

        return {
            riskScore: Math.min(riskScore, 100),
            flags
        };
    }

    private async reportRisk(userId: string, riskScore: number, flags: string[]) {
        const userUrl = this.configService.get<string>('USER_SERVICE_INTERNAL_URL', 'http://user-service:3000/api/users');
        try {
            await firstValueFrom(
                this.httpService.patch(`${userUrl}/${userId}`, {
                    guardianRiskScore: riskScore,
                    guardianFlags: flags
                })
            );
        } catch (error) {
            this.logger.error(`Failed to report risk for user ${userId}: ${error.message}`);
        }
    }

    // Placeholder for future admin notification integration
    async flagUser(userId: string, reason: string) {
        this.logger.error(`[HIGH RISK] User ${userId} flagged for: ${reason}`);
        // Ensure risk is reported if flagged manually/externally
        await this.reportRisk(userId, 100, ['MANUALLY_FLAGGED', reason]);
    }
}
