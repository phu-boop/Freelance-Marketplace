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

        if (dispute.arbitrationCase && dispute.arbitrationCase.status !== 'OPEN' && dispute.arbitrationCase.status !== 'IN_REVIEW') {
            throw new ForbiddenException('Arbitration case is not in a state to accept new evidence');
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
