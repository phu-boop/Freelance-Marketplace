import { Injectable, Logger, NotFoundException, ConflictException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DisputesService {
    private readonly logger = new Logger(DisputesService.name);

    constructor(
        private prisma: PrismaService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { }

    async escalateToArbitration(disputeId: string, userId: string) {
        const dispute = await this.prisma.dispute.findUnique({
            where: { id: disputeId },
        });

        if (!dispute) throw new NotFoundException('Dispute not found');
        if (dispute.status !== 'OPEN') throw new ConflictException('Dispute must be OPEN to escalate');

        const ARBITRATION_FEE = 50.0; // Mock arbitration fee

        // Deduct fees from both parties (Client and Freelancer) via Payment Service
        await this.deductArbitrationFee(dispute.contractId, ARBITRATION_FEE);

        // Create Arbitration Case
        const arbitration = await this.prisma.arbitrationCase.create({
            data: {
                contractId: dispute.contractId,
                disputeId: dispute.id,
                status: 'OPEN',
                fees: ARBITRATION_FEE,
            },
        });

        // Update Dispute Status
        await this.prisma.dispute.update({
            where: { id: disputeId },
            data: { status: 'UNDER_REVIEW' },
        });

        this.logger.log(`Dispute ${disputeId} escalated to arbitration case ${arbitration.id} by user ${userId}`);
        return arbitration;
    }

    async addEvidence(disputeId: string, uploaderId: string, data: { fileUrl: string; description: string; fileType?: string }) {
        const dispute = await this.prisma.dispute.findUnique({
            where: { id: disputeId },
            include: { arbitrationCase: true }
        });
        if (!dispute) throw new NotFoundException('Dispute not found');

        // Evidence Locking
        if (dispute.status === 'RESOLVED' || dispute.status === 'CLOSED') {
            throw new ForbiddenException('Cannot add evidence to a resolved or closed dispute');
        }

        if (dispute.arbitrationCase && dispute.arbitrationCase.status !== 'OPEN') {
            throw new ForbiddenException('Arbitration case is now under active review and evidence is locked.');
        }

        const evidence = await this.prisma.evidence.create({
            data: {
                disputeId,
                uploaderId,
                fileUrl: data.fileUrl,
                fileType: data.fileType || 'UNKNOWN',
                description: data.description,
            },
        });

        return evidence;
    }

    async assignInvestigator(caseId: string, investigatorId: string) {
        const arbCase = await this.prisma.arbitrationCase.findUnique({ where: { id: caseId } });
        if (!arbCase) throw new NotFoundException('Arbitration Case not found');

        return this.prisma.arbitrationCase.update({
            where: { id: caseId },
            data: {
                investigatorId,
                status: 'IN_REVIEW',
            },
        });
    }

    async resolveCase(caseId: string, decision: string, investigatorId: string) {
        const arbCase = await this.prisma.arbitrationCase.findUnique({
            where: { id: caseId },
            include: { dispute: true }
        });

        if (!arbCase) throw new NotFoundException('Arbitration Case not found');

        // In strict mode, check if resolving user is the assigned investigator
        // if (arbCase.investigatorId !== investigatorId) throw new ForbiddenException(...);

        const updatedCase = await this.prisma.arbitrationCase.update({
            where: { id: caseId },
            data: {
                status: 'RESOLVED',
                decision,
            },
        });

        // Close Dispute
        await this.prisma.dispute.update({
            where: { id: arbCase.disputeId },
            data: {
                status: 'RESOLVED',
                resolution: decision,
                resolvedAt: new Date(),
            },
        });

        this.logger.log(`Arbitration case ${caseId} resolved with decision: ${decision}`);
        return updatedCase;
    }

    async resolveCaseWithSplit(caseId: string, milestoneId: string, freelancerPercentage: number, decision: string, investigatorId: string) {
        const arbCase = await this.prisma.arbitrationCase.findUnique({
            where: { id: caseId },
            include: { dispute: true, contract: true }
        });

        if (!arbCase) throw new NotFoundException('Arbitration Case not found');

        const paymentServiceUrl = this.configService.get('PAYMENT_SERVICE_URL') || 'http://payment-service:3005';

        try {
            // Trigger Split Release in Payment Service
            await firstValueFrom(
                this.httpService.post(`${paymentServiceUrl}/api/payments/escrow/split-release`, {
                    contractId: arbCase.contractId,
                    milestoneId,
                    freelancerId: arbCase.contract.freelancer_id,
                    freelancerPercentage,
                })
            );
        } catch (error) {
            this.logger.error(`Failed to process split resolution: ${error.message}`);
            throw new InternalServerErrorException('Failed to process financial split. Ensure payment service is reachable.');
        }

        // Update Case and Dispute
        const updatedCase = await this.prisma.arbitrationCase.update({
            where: { id: caseId },
            data: {
                status: 'RESOLVED',
                decision: `SPLIT ${freelancerPercentage}/${100 - freelancerPercentage}: ${decision}`,
            },
        });

        await this.prisma.dispute.update({
            where: { id: arbCase.disputeId },
            data: {
                status: 'RESOLVED',
                resolution: decision,
                resolvedAt: new Date(),
            },
        });

        return updatedCase;
    }

    async getAiAnalysis(disputeId: string) {
        const dispute = await this.prisma.dispute.findUnique({
            where: { id: disputeId },
            include: { contract: { include: { milestones: true } } }
        });

        if (!dispute) throw new NotFoundException('Dispute not found');

        // Fetch messages for context from communication-service (mocking for now or fetching if available)
        // For this implementation, we'll assume a basic set of recent summary info
        const jobServiceUrl = this.configService.get('JOB_SERVICE_URL') || 'http://job-service:3000';

        try {
            const { data } = await firstValueFrom(
                this.httpService.post(`${jobServiceUrl}/api/jobs/ai/analyze-dispute`, {
                    disputeId,
                    context: {
                        contractTitle: dispute.contract.job_id, // Simplified
                        milestoneDescription: dispute.contract.milestones[0]?.description || 'General Contract',
                        claimPercentage: 100, // Default to full claim analysis
                        messages: [dispute.reason] // Using dispute reason as the primary context for now
                    }
                })
            );
            return data;
        } catch (error) {
            this.logger.error(`AI analysis failed: ${error.message}`);
            return {
                summary: "AI analysis is currently unavailable. Please proceed with manual review.",
                suggestedFreelancerPercentage: 50,
                confidenceRating: 0.5
            };
        }
    }

    async getCaseDetails(caseId: string) {
        return this.prisma.arbitrationCase.findUnique({
            where: { id: caseId },
            include: {
                dispute: {
                    include: {
                        evidence: true
                    }
                },
                contract: true
            }
        });
    }

    async cleanupOldEvidence() {
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        // Find resolved disputes older than 60 days
        const oldDisputes = await this.prisma.dispute.findMany({
            where: {
                status: 'RESOLVED',
                resolvedAt: { lt: sixtyDaysAgo }
            },
            include: { evidence: true }
        });

        this.logger.log(`Found ${oldDisputes.length} disputes for evidence cleanup.`);

        for (const dispute of oldDisputes) {
            if (dispute.evidence.length > 0) {
                // In a real scenario, we would also delete the files from S3/MinIO here
                await this.prisma.evidence.deleteMany({
                    where: { disputeId: dispute.id }
                });
                this.logger.log(`Cleaned up ${dispute.evidence.length} evidence records for dispute ${dispute.id}`);
            }
        }
    }

    private async deductArbitrationFee(contractId: string, amount: number) {
        const contract = await this.prisma.contract.findUnique({ where: { id: contractId } });
        if (!contract) throw new NotFoundException('Contract not found');

        const paymentServiceUrl = this.configService.get('PAYMENT_SERVICE_URL') || 'http://payment-service:3005';

        try {
            // Deduct from both parties
            const parties = [contract.client_id, contract.freelancer_id];

            for (const userId of parties) {
                await firstValueFrom(
                    this.httpService.post(`${paymentServiceUrl}/api/payments/arbitration/deduct`, {
                        userId,
                        amount: amount / 2, // Shared fee
                        contractId,
                    })
                );
            }
        } catch (error) {
            this.logger.error(`Arbitration fee deduction failed: ${error.message}`);
            throw new InternalServerErrorException('Failed to process arbitration fees. Ensure both parties have sufficient balance.');
        }
    }
}
