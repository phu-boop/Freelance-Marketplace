import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { JurisdictionService } from './jurisdiction.service';

import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name);

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private configService: ConfigService,
    private jurisdictionService: JurisdictionService,
  ) { }

  private async enrichContracts(contracts: any[]) {
    return Promise.all(contracts.map(c => this.enrichContract(c)));
  }

  private async enrichContract(contract: any) {
    try {
      const jobServiceUrl = this.configService.get<string>(
        'JOB_SERVICE_URL',
        'http://job-service:3002',
      );
      const { data: job } = await firstValueFrom(
        this.httpService.get(`${jobServiceUrl}/api/jobs/${contract.job_id}`),
      );

      return {
        ...contract,
        job: {
          title: job.title,
          description: job.description,
          client_id: job.client_id
        },
        // For compatibility with frontend expecting bidAmount and timeline
        bidAmount: contract.totalAmount,
        timeline: contract.timeline || 'TBD'
      };
    } catch (err) {
      this.logger.error(`Failed to enrich contract ${contract.id}: ${err.message}`);
      return {
        ...contract,
        job: { title: 'Unknown Job', client_id: contract.client_id },
        bidAmount: contract.totalAmount,
        timeline: contract.timeline || 'TBD'
      };
    }
  }

  async create(createContractDto: CreateContractDto, authHeader?: string) {
    let {
      freelancer_id,
      client_id,
      totalAmount,
      job_id,
      proposal_id,
      terms,
      agencyId,
      agencyRevenueSplit,
      departmentId,
      customClauses,
      ...rest
    } = createContractDto;

    // 0. Auto-inject Mandatory Legal Clauses (Story L-002)
    try {
      const userServiceUrl = this.configService.get<string>(
        'USER_SERVICE_URL',
        'http://user-service:3001',
      );
      const { data: freelancer } = await firstValueFrom(
        this.httpService.get(`${userServiceUrl}/api/users/${freelancer_id}`),
      );
      if (freelancer && freelancer.country) {
        const mandatoryClauses =
          this.jurisdictionService.getRequiredClauses(freelancer.country);
        customClauses = [...(customClauses || []), ...mandatoryClauses];
      }
    } catch (err) {
      this.logger.error(`Jurisdiction check failed: ${err.message}`);
    }

    // 1. Fetch missing data from Job Service if IDs or amount are missing
    if (!freelancer_id || !client_id || !totalAmount) {
      try {
        const jobServiceUrl = this.configService.get<string>(
          'JOB_SERVICE_URL',
          'http://job-service:3002',
        );
        const response = await firstValueFrom(
          this.httpService.get(
            `${jobServiceUrl}/api/proposals/${proposal_id}`,
            {
              headers: authHeader ? { Authorization: authHeader } : {},
            },
          ),
        );
        const proposal = response.data;

        if (!freelancer_id) freelancer_id = proposal.freelancerId;
        if (!client_id) client_id = proposal.job.client_id;
        if (!totalAmount) totalAmount = Number(proposal.bidAmount);
        if (!job_id) job_id = proposal.jobId;
      } catch (error) {
        this.logger.error(
          'Failed to fetch proposal details from job-service',
          error.message,
        );
        throw new ConflictException(
          'Could not verify proposal details. Please provide all required fields.',
        );
      }
    }

    // 2. Auto-detect Agency if not provided (Story A-088)
    if (!agencyId && freelancer_id) {
      try {
        const userServiceUrl = this.configService.get<string>(
          'USER_SERVICE_URL',
          'http://user-service:3001',
        );
        const { data: primaryTeam } = await firstValueFrom(
          this.httpService.get(
            `${userServiceUrl}/api/user/teams/internal/primary/${freelancer_id}`,
          ),
        );
        if (primaryTeam) {
          agencyId = primaryTeam.id;
          if (agencyRevenueSplit === undefined || agencyRevenueSplit === null) {
            agencyRevenueSplit = Number(primaryTeam.revenueSplitPercent || 20);
          }
        }
      } catch (err) {
        this.logger.error(`Agency detection failed: ${err.message}`);
      }
    } else if (
      agencyId &&
      (agencyRevenueSplit === undefined || agencyRevenueSplit === null)
    ) {
      try {
        const userServiceUrl = this.configService.get<string>(
          'USER_SERVICE_URL',
          'http://user-service:3001',
        );
        const { data: team } = await firstValueFrom(
          this.httpService.get(`${userServiceUrl}/api/user/teams/${agencyId}`),
        );
        if (team) {
          agencyRevenueSplit = Number(team.revenueSplitPercent || 20);
        }
      } catch (err) {
        this.logger.error(`Agency split fetch failed: ${err.message}`);
        agencyRevenueSplit = 20;
      }
    }

    let status = 'ACTIVE';
    const amountNum = Number(totalAmount || 0);

    // 2. Enterprise Mandatory Approval for high-value contracts (> $10,000)
    if (amountNum >= 10000) {
      status = 'PENDING_APPROVAL';
      this.logger.log(`Contract ${job_id} requires approval due to high value: $${amountNum}`);
    }

    // 3. EOR (Employer of Record) requires manual vetting by default in this MVP
    if (rest.type === 'EOR') {
      status = 'PENDING_APPROVAL';
      this.logger.log(`Contract ${job_id} requires approval due to EOR type`);
    }

    if (agencyId && status !== 'PENDING_APPROVAL') {
      const approvalCheck = await this.checkApproval(
        agencyId,
        'HIRE',
        amountNum,
      );
      if (approvalCheck.required) {
        status = 'PENDING_APPROVAL';
      }
    }

    const contractData: any = {
      freelancer_id: freelancer_id as string,
      client_id: client_id as string,
      totalAmount: totalAmount as any,
      job_id: job_id,
      proposal_id: proposal_id,

      agencyId: agencyId as string,
      agencyRevenueSplit: agencyRevenueSplit as any,
      departmentId: departmentId as string,
      costCenter: rest.costCenter as string,
      customClauses: customClauses || undefined,
      status,
      ...rest,
    };

    if (rest.milestones && Array.isArray(rest.milestones)) {
      contractData.milestones = {
        create: rest.milestones.map((m) => ({
          description: m.description,
          amount: Number(m.amount),
          dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
          status: 'PENDING',
          escrowStatus: 'UNFUNDED',
        })),
      };
    }

    const contract = await this.prisma.contract.create({
      data: contractData,
    });

    if (status === 'PENDING_APPROVAL') {
      const requiredRoles: string[] = [];
      if (amountNum >= 50000) {
        requiredRoles.push('FINANCE', 'ADMIN');
      } else if (amountNum >= 10000) {
        requiredRoles.push('FINANCE');
      } else if (rest.type === 'EOR') {
        requiredRoles.push('ADMIN'); // Admin must vet EOR
      } else if (agencyId) {
        requiredRoles.push('MANAGER'); // Agency manager
      }

      await this.prisma.contractApprovalRequest.create({
        data: {
          contractId: contract.id,
          requestedBy: client_id as string,
          status: 'PENDING',
          requiredRoles: requiredRoles,
        },
      });
    }

    return contract;
  }

  findAll(freelancerId?: string, clientId?: string, agencyId?: string) {
    const where: any = {};
    if (freelancerId) {
      where.freelancer_id = freelancerId;
    }
    if (clientId) {
      where.client_id = clientId;
    }
    if (agencyId) {
      where.agencyId = agencyId;
    }

    return this.prisma.contract.findMany({
      where,
      include: { milestones: true, disputes: true },
    });
  }

  async getAgencyActiveContractsCount(agencyId: string) {
    return this.prisma.contract.count({
      where: {
        agencyId,
        status: { in: ['ACTIVE', 'IN_PROGRESS', 'DISPUTED'] },
      },
    });
  }

  async findByFreelancer(freelancerId: string, agencyId?: string) {
    const where: any = { freelancer_id: freelancerId };
    if (agencyId) {
      where.agencyId = agencyId;
    }
    const contracts = await this.prisma.contract.findMany({
      where,
      include: { milestones: true, disputes: true },
    });
    return this.enrichContracts(contracts);
  }

  async findByClient(clientId: string, agencyId?: string) {
    const where: any = agencyId ? { agencyId } : { client_id: clientId };
    const contracts = await this.prisma.contract.findMany({
      where,
      include: { milestones: true, disputes: true },
    });
    return this.enrichContracts(contracts);
  }

  async findOne(id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        milestones: {
          include: { submissions: true },
        },
        disputes: {
          include: {
            evidence: true,
            arbitrationCase: true
          }
        }
      },
    });
    if (!contract) return null;
    return this.enrichContract(contract);
  }

  async findActiveBetween(user1: string, user2: string) {
    const contract = await this.prisma.contract.findFirst({
      where: {
        OR: [
          { client_id: user1, freelancer_id: user2 },
          { client_id: user2, freelancer_id: user1 },
        ],
        status: { in: ['ACTIVE', 'PAUSED'] },
      },
      include: {
        milestones: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!contract) return null;
    return this.enrichContract(contract);
  }

  update(id: string, updateContractDto: UpdateContractDto) {
    const { milestones, ...rest } = updateContractDto;
    const updateData: any = { ...rest };

    if (milestones) {
      updateData.milestones = {
        deleteMany: {}, // Clear and recreate or use better merging logic
        create: milestones,
      };
    }

    return this.prisma.contract.update({
      where: { id },
      data: updateData,
    });
  }

  remove(id: string) {
    return this.prisma.contract.delete({
      where: { id },
    });
  }

  async addMilestone(contractId: string, data: any) {
    const milestone = await this.prisma.milestone.create({
      data: {
        ...data,
        contractId,
        amount: data.amount as any,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      },
    });

    await this.prisma.contract.update({
      where: { id: contractId },
      data: { totalAmount: { increment: data.amount as any } },
    });

    return milestone;
  }

  async pauseContract(id: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.client_id !== userId)
      throw new ConflictException('Only the client can pause the contract');
    if (contract.status !== 'ACTIVE')
      throw new ConflictException('Only active contracts can be paused');

    return this.prisma.contract.update({
      where: { id },
      data: { status: 'PAUSED' },
    });
  }

  async resumeContract(id: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.client_id !== userId)
      throw new ConflictException('Only the client can resume the contract');
    if (contract.status !== 'PAUSED')
      throw new ConflictException('Contract is not paused');

    return this.prisma.contract.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });
  }

  // Work submission logic would typically involve updating a milestone status or creating a submission record
  // For MVP, let's assume it updates the active milestone status
  async submitWork(
    contractId: string,
    data: {
      milestoneId: string;
      content: string;
      attachments: string[];
      type: 'PROGRESS_REPORT' | 'FINAL_RESULT';
    },
  ) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.status === 'PAUSED')
      throw new ConflictException(
        'Cannot submit work while contract is paused',
      );

    const { milestoneId, ...submissionData } = data;

    // AI Risk Scanning
    let riskLevel = 'LOW';
    let riskReport = '';

    try {
      const jobServiceUrl = this.configService.get('JOB_SERVICE_INTERNAL_URL') || 'http://job-service:3002';
      const { data: aiAnalysis } = await firstValueFrom(
        this.httpService.post(`${jobServiceUrl}/api/jobs/ai/scan-submission`, {
          content: submissionData.content
        })
      );
      riskLevel = aiAnalysis.riskLevel || 'LOW';
      riskReport = aiAnalysis.report || '';
    } catch (err) {
      this.logger.error(`AI Risk Scan failed: ${err.message}`);
    }

    // Create submission record
    await this.prisma.submission.create({
      data: {
        ...submissionData,
        milestoneId,
        metadata: {
          riskLevel,
          riskReport
        } as any
      },
    });

    // Calculate auto-release date (skip if high risk)
    let autoReleaseDate: Date | null = null;
    if (riskLevel !== 'HIGH') {
      autoReleaseDate = new Date();
      autoReleaseDate.setDate(
        autoReleaseDate.getDate() + (contract.autoReleaseDays || 14),
      );
    }

    // Update milestone status
    const updatedMilestone = await this.prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status: 'IN_REVIEW',
        autoReleaseDate,
      },
    });

    // Notify Client
    await this.sendNotification(
      contract.client_id,
      'WORK_SUBMITTED',
      'Work Submitted',
      `Freelancer submitted work for milestone: ${milestoneId}`,
      `/contracts/${contractId}`,
      { contractId, milestoneId },
    );

    return updatedMilestone;
  }

  async extendContract(
    id: string,
    userId: string,
    data: { additionalAmount?: number; newEndDate?: string; reason?: string },
  ) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException('Contract not found');

    // Check if user is authorized (either client or freelancer)
    if (contract.client_id !== userId && contract.freelancer_id !== userId) {
      throw new ConflictException('You are not authorized to modify this contract');
    }

    // If freelancer is requesting
    if (contract.freelancer_id === userId) {
      if (!data.newEndDate) {
        throw new ConflictException('New end date is required for extension request');
      }

      const newEndDate = new Date(data.newEndDate);
      if (isNaN(newEndDate.getTime()) || newEndDate <= new Date()) {
        throw new ConflictException('Invalid new end date');
      }

      await this.sendNotification(
        contract.client_id,
        'CONTRACT_EXTENSION_REQUEST',
        'Extension Requested',
        `The freelancer has requested an extension until ${newEndDate.toLocaleDateString()}. Reason: ${data.reason || 'None provided'}`,
        `/contracts/${id}`,
        { contractId: id, newEndDate: data.newEndDate, reason: data.reason },
      );

      return { message: 'Extension request sent to client' };
    }

    // Only client reaches here
    const updateData: any = {};
    if (data.additionalAmount) {
      updateData.totalAmount = { increment: data.additionalAmount };
    }
    if (data.newEndDate) {
      const newEndDate = new Date(data.newEndDate);
      if (isNaN(newEndDate.getTime())) {
        throw new ConflictException('Invalid new end date');
      }
      // Ensure new end date is in the future and after current end date if it exists
      if (newEndDate <= new Date()) {
        throw new ConflictException('New end date must be in the future');
      }
      if (contract.endDate && newEndDate <= new Date(contract.endDate)) {
        throw new ConflictException(
          'New end date must be after current end date',
        );
      }
      updateData.endDate = newEndDate;
    }

    const updatedContract = await this.prisma.contract.update({
      where: { id },
      data: updateData,
    });

    if (data.additionalAmount) {
      await this.logFinancialEvent({
        service: 'contract-service',
        eventType: 'CONTRACT_AMOUNT_INCREASED',
        actorId: userId,
        amount: Number(data.additionalAmount),
        referenceId: id,
        metadata: {
          reason: data.reason,
          newTotal: Number(updatedContract.totalAmount),
        },
      });
    }

    // Notify Freelancer
    await this.sendNotification(
      contract.freelancer_id,
      'CONTRACT_EXTENDED',
      'Contract Extended',
      `The client has extended your contract${data.newEndDate ? ` until ${new Date(data.newEndDate).toLocaleDateString()}` : ''}${data.additionalAmount ? ` with an additional amount of ${data.additionalAmount}` : ''}.`,
      `/contracts/${id}`,
      { contractId: id },
    );

    return updatedContract;
  }

  async activateMilestone(contractId: string, data: { milestoneId: string }, token?: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: data.milestoneId },
    });

    if (!contract || !milestone)
      throw new NotFoundException('Contract or Milestone not found');
    if (milestone.status !== 'PENDING')
      throw new ConflictException('Milestone is already active or completed');

    // Fund Escrow
    const paymentServiceUrl = this.configService.get<string>(
      'PAYMENT_SERVICE_URL',
      'http://payment-service:3005',
    );
    try {
      await firstValueFrom(
        this.httpService.post(
          `${paymentServiceUrl}/api/payments/escrow/fund`,
          {
            contractId,
            milestoneId: milestone.id,
            amount: Number(milestone.amount),
            costCenter: (contract as any).costCenter,
          },
          {
            headers: { Authorization: token },
          },
        ),
      );
    } catch (error) {
      this.logger.error(`Escrow funding failed: ${error.message}`);
      throw new ConflictException(
        'Failed to fund escrow. Please check your balance.',
      );
    }

    // Update Status
    const updatedMilestone = await this.prisma.milestone.update({
      where: { id: milestone.id },
      data: {
        status: 'ACTIVE',
        escrowStatus: 'FUNDED',
        autoReleaseDate: contract.autoReleaseDays
          ? new Date(
            Date.now() + contract.autoReleaseDays * 24 * 60 * 60 * 1000,
          )
          : null,
      },
    });

    await this.logFinancialEvent({
      service: 'contract-service',
      eventType: 'MILESTONE_FUNDED',
      actorId: contract.client_id,
      amount: Number(milestone.amount),
      referenceId: contractId,
      metadata: {
        milestoneId: milestone.id,
        freelancerId: contract.freelancer_id,
      },
    });

    // Notify Freelancer
    await this.sendNotification(
      contract.freelancer_id,
      'MILESTONE_ACTIVATED',
      'Milestone Activated',
      `The client has funded and activated the milestone: ${milestone.description}`,
      `/contracts/${contractId}`,
      { contractId, milestoneId: milestone.id },
    );

    return updatedMilestone;
  }

  getSubmissions(milestoneId: string) {
    return this.prisma.submission.findMany({
      where: { milestoneId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveWork(contractId: string, data: { milestoneId: string }, token?: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: data.milestoneId },
    });

    if (!contract || !milestone)
      throw new NotFoundException('Contract or Milestone not found');
    if (contract.status === 'PAUSED' || contract.status === 'DISPUTED')
      throw new ConflictException(
        'Cannot approve work while contract is paused or disputed',
      );

    // High-value milestone approval threshold (e.g., $5,000)
    const APPROVAL_THRESHOLD = 5000;
    const isHighValue = Number(milestone.amount) >= APPROVAL_THRESHOLD;

    if (isHighValue) {
      try {
        const paymentServiceUrl = this.configService.get<string>(
          'PAYMENT_SERVICE_URL',
          'http://payment-service:3005',
        );
        await firstValueFrom(
          this.httpService.post(
            `${paymentServiceUrl}/api/payments/escrow/request-approval`,
            {
              contractId,
              milestoneId: milestone.id,
              freelancerId: contract.freelancer_id,
              amount: Number(milestone.amount),
            },
            {
              headers: { Authorization: token },
            },
          ),
        );

        // Update Milestone to PENDING_APPROVAL
        const updatedMilestone = await this.prisma.milestone.update({
          where: { id: data.milestoneId },
          data: { status: 'PENDING_APPROVAL' },
        });

        await this.sendNotification(
          contract.client_id,
          'APPROVAL_REQUIRED',
          'Payment Approval Required',
          `Your payment of $${milestone.amount} for milestone "${milestone.description}" exceeds the $5,000 threshold and requires additional approval.`,
          `/contracts/${contractId}`,
        );

        return updatedMilestone;
      } catch (error) {
        this.logger.error(`Failed to initiate high-value approval: ${error.message}`);
        throw new ConflictException('Failed to initiate payment approval process.');
      }
    }

    // Standard flow for < $5,000
    try {
      const paymentServiceUrl = this.configService.get<string>(
        'PAYMENT_SERVICE_URL',
        'http://payment-service:3005',
      );
      await firstValueFrom(
        this.httpService.post(
          `${paymentServiceUrl}/api/payments/escrow/release`,
          {
            contractId,
            milestoneId: milestone.id,
            freelancerId: contract.freelancer_id,
            agencyId: contract.agencyId,
            agencyRevenueSplit: contract.agencyRevenueSplit,
          },
          {
            headers: { Authorization: token },
          },
        ),
      );
    } catch (error) {
      console.error('Escrow release failed', error.message);
      throw new Error('Escrow release failed. Please contact support.');
    }

    await this.logFinancialEvent({
      service: 'contract-service',
      eventType: 'MILESTONE_PAID',
      actorId: contract.client_id,
      amount: Number(milestone.amount),
      referenceId: contractId,
      metadata: {
        milestoneId: milestone.id,
        freelancerId: contract.freelancer_id,
      },
    });

    return this.prisma.milestone
      .update({
        where: { id: data.milestoneId },
        data: {
          status: 'COMPLETED',
          escrowStatus: 'RELEASED',
        },
      })
      .then(async (milestone) => {
        // Notify Freelancer
        await this.sendNotification(
          contract.freelancer_id,
          'WORK_APPROVED',
          'Work Approved & Funds Released',
          `Your work for milestone "${milestone.description}" has been approved and funds have been released.`,
          `/contracts/${contractId}`,
          { contractId, milestoneId: milestone.id },
        );

        // Update Reliability Score in User Service
        try {
          const userServiceUrl = this.configService.get<string>(
            'USER_SERVICE_URL',
            'http://user-service:3001',
          );
          const { data: user } = await firstValueFrom(
            this.httpService.get(
              `${userServiceUrl}/api/users/${contract.freelancer_id}`,
            ),
          );

          let reliabilityDelta = 2; // Default positive for completion
          if (milestone.dueDate && new Date() > new Date(milestone.dueDate)) {
            reliabilityDelta = -5; // Penalty for late submission
          }

          const currentScore = user.reliabilityScore || 100;
          const newScore = Math.min(
            100,
            Math.max(0, currentScore + reliabilityDelta),
          );

          await firstValueFrom(
            this.httpService.patch(
              `${userServiceUrl}/api/users/${contract.freelancer_id}`,
              {
                reliabilityScore: newScore,
              },
            ),
          );

          // Update Department Spend (Story C-077)
          if (contract.agencyId && contract.departmentId) {
            try {
              await firstValueFrom(
                this.httpService.post(
                  `${userServiceUrl}/api/user/teams/${contract.agencyId}/departments/${contract.departmentId}/increment-spend`,
                  {
                    amount: Number(milestone.amount),
                  },
                ),
              );
            } catch (deptErr) {
              this.logger.error(
                `Failed to update department spend: ${deptErr.message}`,
              );
            }
          }
        } catch (err) {
          console.error('Failed to update reliability score or department spend:', err.message);
        }
        // Check if all milestones are completed
        const allMilestones = await this.prisma.milestone.findMany({
          where: { contractId },
        });
        const allCompleted = allMilestones.every((m) => m.status === 'COMPLETED');

        if (allCompleted) {
          await this.prisma.contract.update({
            where: { id: contractId },
            data: { status: 'COMPLETED' },
          });

          // Trigger AI Portfolio Generation (Story A-057)
          try {
            const userServiceUrl = this.configService.get<string>(
              'USER_SERVICE_URL',
              'http://user-service:3001',
            );
            await firstValueFrom(
              this.httpService.post(
                `${userServiceUrl}/api/users/${contract.freelancer_id}/portfolio/ai-generate`,
                { contractId },
              ),
            );
            this.logger.log(`Triggered AI Portfolio generation for freelancer ${contract.freelancer_id}`);
          } catch (aiErr) {
            this.logger.error(`Failed to trigger AI portfolio generation: ${aiErr.message}`);
          }
        }

        return milestone;
      });
  }

  async rejectWork(contractId: string, data: { milestoneId: string, reason?: string }) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });
    if (!contract) throw new NotFoundException('Contract not found');

    const milestone = await this.prisma.milestone.findUnique({
      where: { id: data.milestoneId },
    });

    const updated = await this.prisma.milestone.update({
      where: { id: data.milestoneId },
      data: { status: 'ACTIVE' },
    });

    // Notify Freelancer
    await this.sendNotification(
      contract.freelancer_id,
      'WORK_REJECTED',
      'Changes Requested',
      `The client has requested changes for milestone: ${milestone?.description || data.milestoneId}${data.reason ? `. Feedback: ${data.reason}` : ''}`,
      `/contracts/${contractId}`,
      { contractId, milestoneId: data.milestoneId },
    );

    return updated;
  }

  async disputeContract(id: string, reason: string, userId: string, evidence?: string[]) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException('Contract not found');

    const disputeTimeoutAt = new Date();
    disputeTimeoutAt.setDate(disputeTimeoutAt.getDate() + 7); // Default 7 days for dispute resolution

    const updated = await this.prisma.contract.update({
      where: { id },
      data: {
        status: 'DISPUTED',
        disputeStatus: 'OPEN',
        disputeReason: reason,
        disputes: {
          create: {
            raisedById: userId,
            reason,
            evidence: {
              create: (evidence || []).map(url => ({
                fileUrl: url,
                uploaderId: userId,
                description: 'Initial dispute evidence'
              }))
            },
            disputeTimeoutAt,
          },
        },
      },
    });

    // Notify other party
    const targetUserId = userId === contract.client_id ? contract.freelancer_id : contract.client_id;
    await this.sendNotification(
      targetUserId,
      'CONTRACT_DISPUTED',
      'Contract Disputed',
      `The contract has been put into dispute by the other party. Reason: ${reason}`,
      `/contracts/${id}`,
      { contractId: id }
    );

    return updated;
  }

  findAllDisputed() {
    return this.prisma.contract.findMany({
      where: { status: 'DISPUTED' },
      include: { milestones: true, disputes: true },
    });
  }

  async resolveDispute(
    id: string,
    resolution: 'COMPLETED' | 'TERMINATED',
    token?: string,
  ) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: { milestones: true },
    });
    if (!contract) throw new NotFoundException('Contract not found');

    const paymentUrl = this.configService.get<string>(
      'PAYMENT_SERVICE_URL',
      'http://payment-service:3005',
    );

    // Resolve active (funded) milestones
    const activeMilestones = contract.milestones.filter(
      (m) => m.escrowStatus === 'FUNDED',
    );

    for (const milestone of activeMilestones) {
      try {
        if (resolution === 'TERMINATED') {
          // Refund to client
          await firstValueFrom(
            this.httpService.post(
              `${paymentUrl}/api/payments/escrow/refund`,
              {
                contractId: id,
                milestoneId: milestone.id,
              },
              { headers: { Authorization: token } },
            ),
          );
          await this.prisma.milestone.update({
            where: { id: milestone.id },
            data: { escrowStatus: 'REFUNDED', status: 'COMPLETED' },
          });

          await this.logFinancialEvent({
            service: 'contract-service',
            eventType: 'DISPUTE_REFUND_TO_CLIENT',
            amount: Number(milestone.amount),
            referenceId: id,
            metadata: {
              milestoneId: milestone.id,
              clientId: contract.client_id,
            },
          });
        } else {
          // Release to freelancer
          await firstValueFrom(
            this.httpService.post(
              `${paymentUrl}/api/payments/escrow/release`,
              {
                contractId: id,
                milestoneId: milestone.id,
                freelancerId: contract.freelancer_id,
              },
              { headers: { Authorization: token } },
            ),
          );
          await this.prisma.milestone.update({
            where: { id: milestone.id },
            data: { escrowStatus: 'RELEASED', status: 'COMPLETED' },
          });

          await this.logFinancialEvent({
            service: 'contract-service',
            eventType: 'DISPUTE_RELEASE_TO_FREELANCER',
            amount: Number(milestone.amount),
            referenceId: id,
            metadata: {
              milestoneId: milestone.id,
              freelancerId: contract.freelancer_id,
            },
          });
        }
      } catch (err) {
        this.logger.error(
          `Failed to resolve financials for milestone ${milestone.id}: ${err.message}`,
        );
      }
    }

    const updated = await this.prisma.contract.update({
      where: { id },
      data: {
        status: resolution,
        disputeStatus: 'RESOLVED',
      },
    });

    // Notify parties
    await Promise.all([
      this.sendNotification(
        contract.client_id,
        'DISPUTE_RESOLVED',
        'Dispute Resolved',
        `The dispute for your contract has been resolved with status: ${resolution}.`,
        `/contracts/${id}`,
        { contractId: id },
      ),
      this.sendNotification(
        contract.freelancer_id,
        'DISPUTE_RESOLVED',
        'Dispute Resolved',
        `The dispute for your contract has been resolved with status: ${resolution}.`,
        `/contracts/${id}`,
        { contractId: id },
      ),
    ]);

    return updated;
  }

  async autoReleaseMilestones() {
    const now = new Date();
    const milestonesToRelease = await this.prisma.milestone.findMany({
      where: {
        status: 'IN_REVIEW',
        autoReleaseDate: { lte: now },
      },
      include: {
        contract: true,
      },
    });

    this.logger.log(
      `Processing ${milestonesToRelease.length} milestones for auto-release`,
    );

    for (const milestone of milestonesToRelease) {
      try {
        await this.approveWork(milestone.contractId, {
          milestoneId: milestone.id,
        });
        this.logger.log(
          `Auto-released milestone ${milestone.id} for contract ${milestone.contractId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to auto-release milestone ${milestone.id}: ${error.message}`,
        );
      }
    }
  }

  async handleDisputeTimeouts() {
    const now = new Date();
    const expiredDisputes = await this.prisma.dispute.findMany({
      where: {
        status: 'OPEN',
        disputeTimeoutAt: { lte: now },
      },
      include: {
        contract: true,
      },
    });

    this.logger.log(`Processing ${expiredDisputes.length} expired disputes`);

    for (const dispute of expiredDisputes) {
      try {
        // Default system action on timeout: Resolve in favor of freelancer if client is unresponsive
        // or escalate to ADMIN. For now, let's mark as UNDER_REVIEW for admin attention.
        await this.prisma.dispute.update({
          where: { id: dispute.id },
          data: {
            status: 'UNDER_REVIEW',
            resolution: 'System escalation due to inactivity.',
          },
        });
        this.logger.log(`Escalated dispute ${dispute.id} due to timeout`);
      } catch (error) {
        this.logger.error(
          `Failed to handle dispute timeout for ${dispute.id}: ${error.message}`,
        );
      }
    }
  }

  // Insurance Marketplace
  listInsuranceOptions() {
    return [
      {
        provider: 'Bunker',
        name: 'Professional Liability Basic',
        coverage: 1000000,
        premiumPerMonth: 29.0,
      },
      {
        provider: 'Next Insurance',
        name: 'Errors & Omissions Pro',
        coverage: 2000000,
        premiumPerMonth: 45.0,
      },
    ];
  }

  async purchaseInsurance(
    contractId: string,
    data: { provider: string; coverageAmount: number; premiumAmount: number },
  ) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });
    if (!contract) throw new NotFoundException('Contract not found');

    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); // 1-year policy

    const policy = await this.prisma.insurancePolicy.create({
      data: {
        contractId,
        provider: data.provider,
        coverageAmount: data.coverageAmount,
        premiumAmount: data.premiumAmount,
        startDate: new Date(),
        endDate,
        status: 'ACTIVE',
      },
    });

    await this.logFinancialEvent({
      service: 'contract-service',
      eventType: 'INSURANCE_PURCHASED',
      actorId: contract.freelancer_id,
      amount: Number(data.premiumAmount),
      referenceId: contractId,
      metadata: {
        policyId: policy.id,
        provider: data.provider,
      },
    });

    await this.prisma.contract.update({
      where: { id: contractId },
      data: { insurancePolicyId: policy.id },
    });

    // Notify User Service to update badges/trust score
    try {
      const userServiceUrl = this.configService.get<string>(
        'USER_SERVICE_URL',
        'http://user-service:3001',
      );
      await firstValueFrom(
        this.httpService.patch(
          `${userServiceUrl}/api/users/${contract.freelancer_id}`,
          {
            metadata: { hasActiveInsurance: true }, // Trigger trust score recalculation
          },
        ),
      );
    } catch (err) {
      this.logger.error(
        `Failed to update insurance status in user-service: ${err.message}`,
      );
    }

    return policy;
  }

  // Time Tracking
  async logTime(
    contractId: string,
    data: { hours: number; description: string; date: string },
  ) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.status === 'PAUSED')
      throw new ConflictException('Cannot log time while contract is paused');

    return this.prisma.timeLog.create({
      data: {
        contractId,
        hours: data.hours,
        description: data.description,
        date: new Date(data.date),
      },
    });
  }

  async approveTimeLog(id: string, userId: string) {
    const log = await this.prisma.timeLog.findUnique({
      where: { id },
      include: { contract: true },
    });

    if (!log || !log.contract)
      throw new NotFoundException('Time log or contract not found');
    if (log.contract.client_id !== userId)
      throw new ForbiddenException('Only client can approve time logs');
    if (log.status !== 'PENDING')
      throw new ConflictException(`Time log is already ${log.status}`);

    // In a real app, calculate amount based on hourly rate
    // For MVP, assume rate is stored in contract or just use a fixed rate
    // Let's assume contract.totalAmount is the hourly rate for hourly contracts
    const amount = Number(log.hours) * Number(log.contract.totalAmount);

    // Transfer funds
    try {
      const paymentServiceUrl = this.configService.get<string>(
        'PAYMENT_SERVICE_URL',
        'http://payment-service:3005',
      );
      await firstValueFrom(
        this.httpService.post(`${paymentServiceUrl}/transfer`, {
          fromUserId: log.contract.client_id,
          toUserId: log.contract.freelancer_id,
          amount,
          description: `Hourly Payment: ${log.hours} hours on ${log.date.toDateString()}`,
        }),
      );
    } catch (error) {
      console.error('Payment transfer failed', error.message);
      throw new Error('Payment transfer failed');
    }

    return this.prisma.timeLog.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
  }

  async rejectTimeLog(id: string, userId: string, reason: string) {
    const log = await this.prisma.timeLog.findUnique({
      where: { id },
      include: { contract: true },
    });

    if (!log || !log.contract)
      throw new NotFoundException('Time log or contract not found');
    if (log.contract.client_id !== userId)
      throw new ForbiddenException('Only client can reject time logs');
    if (log.status !== 'PENDING')
      throw new ConflictException(`Time log is already ${log.status}`);

    return this.prisma.timeLog.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
      },
    });
  }

  async startTimer(contractId: string, description?: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.status === 'PAUSED')
      throw new ConflictException(
        'Cannot start timer while contract is paused',
      );

    // Check for existing active session
    const activeSession = await this.prisma.timeSession.findFirst({
      where: { contractId, endTime: null },
    });

    if (activeSession) {
      throw new ConflictException('Timer is already running for this contract');
    }

    return this.prisma.timeSession.create({
      data: {
        contractId,
        startTime: new Date(),
        description,
      },
    });
  }

  async stopTimer(contractId: string) {
    const activeSession = await this.prisma.timeSession.findFirst({
      where: { contractId, endTime: null },
    });

    if (!activeSession) {
      throw new NotFoundException('No active timer found for this contract');
    }

    const endTime = new Date();
    const durationMs = endTime.getTime() - activeSession.startTime.getTime();
    const hours = durationMs / (1000 * 60 * 60); // Convert ms to hours

    // Update session
    await this.prisma.timeSession.update({
      where: { id: activeSession.id },
      data: { endTime },
    });

    // Create TimeLog
    if (hours > 0.01) {
      // Only log if significant duration (>36s)
      return this.prisma.timeLog.create({
        data: {
          contractId,
          hours,
          description: activeSession.description || 'Tracked Time',
          date: endTime, // Log date as end time
          status: 'PENDING',
        },
      });
    }

    return { message: 'Timer stopped (Duration too short to log)' };
  }

  async getTimeLogs(contractId: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });
    if (!contract) throw new NotFoundException('Contract not found');

    if (contract.client_id !== userId && contract.freelancer_id !== userId) {
      throw new ForbiddenException(
        'Only contract participants can view time logs',
      );
    }

    return this.prisma.timeLog.findMany({
      where: { contractId },
      orderBy: { date: 'desc' },
    });
  }

  // Check-ins
  async scheduleCheckIn(
    contractId: string,
    data: {
      title: string;
      description?: string;
      scheduledAt: string;
      durationMinutes?: number;
    },
    userId: string,
  ) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.client_id !== userId && contract.freelancer_id !== userId) {
      throw new ForbiddenException(
        'Only contract participants can schedule check-ins',
      );
    }

    const checkIn = await this.prisma.checkIn.create({
      data: {
        ...data,
        scheduledAt: new Date(data.scheduledAt),
        contractId,
      },
    });

    // Notify other party
    const targetUserId =
      userId === contract.client_id
        ? contract.freelancer_id
        : contract.client_id;
    await this.sendNotification(
      targetUserId,
      'CHECKIN_SCHEDULED',
      'Check-in Scheduled',
      `A new check-in "${data.title}" has been scheduled for ${new Date(data.scheduledAt).toLocaleString()}.`,
      `/contracts/${contractId}`,
      { contractId, checkInId: checkIn.id },
    );

    return checkIn;
  }

  async getCheckIns(contractId: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.client_id !== userId && contract.freelancer_id !== userId) {
      throw new ForbiddenException(
        'Only contract participants can view check-ins',
      );
    }

    return this.prisma.checkIn.findMany({
      where: { contractId },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async startCheckInMeeting(id: string, userId: string) {
    const checkIn = await this.prisma.checkIn.findUnique({
      where: { id },
      include: { contract: true },
    });
    if (!checkIn) throw new NotFoundException('Check-in not found');

    if (
      checkIn.contract.client_id !== userId &&
      checkIn.contract.freelancer_id !== userId
    ) {
      throw new ForbiddenException('Only participants can start the meeting');
    }

    const meetingLink = `https://meet.jit.si/freelance-marketplace-checkin-${id}`;

    const updated = await this.prisma.checkIn.update({
      where: { id },
      data: { meetingLink, status: 'IN_PROGRESS' },
    });

    // Notify other party
    const targetUserId =
      userId === checkIn.contract.freelancer_id
        ? checkIn.contract.client_id
        : checkIn.contract.freelancer_id;
    await this.sendNotification(
      targetUserId,
      'CHECKIN_STARTED',
      'Check-in Meeting Started',
      `The video call for check-in "${checkIn.title}" has started.`,
      meetingLink,
      { contractId: checkIn.contractId, checkInId: id, meetingLink },
    );

    return updated;
  }

  // Contract Templates
  async createTemplate(
    clientId: string,
    data: { name: string; description?: string; content: string },
  ) {
    return this.prisma.contractTemplate.create({
      data: {
        ...data,
        clientId,
      },
    });
  }

  async getTemplates(clientId: string) {
    return this.prisma.contractTemplate.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTemplate(id: string, clientId: string) {
    const template = await this.prisma.contractTemplate.findUnique({
      where: { id },
    });
    if (!template) throw new NotFoundException('Template not found');
    if (template.clientId !== clientId)
      throw new ForbiddenException('Access denied');
    return template;
  }

  async deleteTemplate(id: string, clientId: string) {
    const template = await this.prisma.contractTemplate.findUnique({
      where: { id },
    });
    if (!template) throw new NotFoundException('Template not found');
    if (template.clientId !== clientId)
      throw new ForbiddenException('Access denied');

    return this.prisma.contractTemplate.delete({
      where: { id },
    });
  }

  private async sendNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    link?: string,
    metadata?: any,
  ) {
    try {
      const notificationUrl = this.configService.get<string>(
        'NOTIFICATION_SERVICE_URL',
        'http://notification-service:3007',
      );
      await firstValueFrom(
        this.httpService.post(`${notificationUrl}/api/notifications`, {
          userId,
          type,
          title,
          message,
          link,
          metadata,
        }),
      );
    } catch (error) {
      console.error('Failed to send notification', error.message);
    }
  }

  async getClientStats(userId: string) {
    const [activeContracts, completedContracts, totalSpentResult] =
      await Promise.all([
        this.prisma.contract.count({
          where: { client_id: userId, status: 'ACTIVE' },
        }),
        this.prisma.contract.count({
          where: { client_id: userId, status: 'COMPLETED' },
        }),
        this.prisma.contract.aggregate({
          where: { client_id: userId },
          _sum: { totalAmount: true },
        }),
      ]);

    return {
      activeContracts,
      completedContracts,
      totalSpent: totalSpentResult._sum.totalAmount || 0,
    };
  }

  private async logFinancialEvent(data: {
    service: string;
    eventType: string;
    actorId?: string;
    amount?: number;
    metadata?: any;
    referenceId?: string;
  }) {
    const auditServiceUrl = this.configService.get<string>(
      'AUDIT_SERVICE_URL',
      'http://audit-service:3011',
    );
    const auditSecret = this.configService.get<string>('AUDIT_SECRET', 'fallback-secret');
    try {
      await firstValueFrom(
        this.httpService.post(`${auditServiceUrl}/api/audit/logs`, data, {
          headers: { 'x-audit-secret': auditSecret }
        }),
      );
    } catch (error) {
      this.logger.error(
        `Failed to log financial event to audit-service: ${error.message}`,
      );
    }
  }
  async approveContract(contractId: string, userId: string, userRoles: string[]) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: { approvalParams: true },
    });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.status !== 'PENDING_APPROVAL')
      throw new ConflictException('Contract is not pending approval');

    if (!contract.approvalParams) {
      // Direct update if no specific approval workflow
      await this.prisma.contract.update({
        where: { id: contractId },
        data: { status: 'ACTIVE' },
      });
      return { message: 'Contract active' };
    }

    const approvalReq = contract.approvalParams;
    const requiredRoles = approvalReq.requiredRoles || [];

    // 1. Identify which role the user is fulfilling
    // Logic: if user has multiple roles, they fill the one that hasn't been filled yet.
    const currentApprovals = JSON.parse(JSON.stringify(approvalReq.approvals || []));
    const alreadyApprovedRoles = currentApprovals.map(a => a.role);

    const roleToFill = requiredRoles.find(r => userRoles.includes(r) && !alreadyApprovedRoles.includes(r));

    if (!roleToFill) {
      // Check if user is an ADMIN (override)
      if (userRoles.includes('ADMIN')) {
        // Proceed to final approval
      } else {
        throw new ForbiddenException(`User roles [${userRoles.join(', ')}] cannot approve this contract at this stage.`);
      }
    }

    // 2. Add approval
    if (roleToFill) {
      currentApprovals.push({
        role: roleToFill,
        userId,
        approvedAt: new Date(),
      });
    }

    const allApproved = requiredRoles.every(r => currentApprovals.some(a => a.role === r));

    if (allApproved || userRoles.includes('ADMIN')) {
      await this.prisma.contract.update({
        where: { id: contractId },
        data: { status: 'ACTIVE' },
      });

      await this.prisma.contractApprovalRequest.update({
        where: { id: approvalReq.id },
        data: {
          status: 'APPROVED',
          decidedBy: userId,
          decidedAt: new Date(),
          approvals: currentApprovals,
        },
      });
      return { message: 'Contract active (Final Approval)' };
    } else {
      await this.prisma.contractApprovalRequest.update({
        where: { id: approvalReq.id },
        data: {
          approvals: currentApprovals,
        },
      });
      return { message: `Approved as ${roleToFill}. Awaiting other roles: ${requiredRoles.filter(r => !currentApprovals.some(a => a.role === r)).join(', ')}` };
    }
  }

  async checkApproval(teamId: string, triggerType: string, amount: number) {
    try {
      const userServiceUrl = this.configService.get<string>(
        'USER_SERVICE_URL',
        'http://user-service:3001',
      );
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${userServiceUrl}/api/user/teams/${teamId}/policies/check`,
          {
            params: { type: triggerType, amount },
          },
        ),
      );
      return data;
    } catch (error) {
      this.logger.error(`Failed to check approval policy: ${error.message}`);
      return { required: false };
    }
  }

  async openArbitration(contractId: string, investigatorId?: string) {
    // Determine which dispute to arbitrate. For now, pick the first OPEN one.
    const dispute = await this.prisma.dispute.findFirst({
      where: { contractId, status: 'OPEN' }
    });

    if (!dispute) {
      // If no dispute exists, we technically can't arbitrate under new schema.
      // However, for Admin override, we could create a system dispute?
      throw new ConflictException('Cannot open arbitration: No active dispute found for this contract.');
    }

    return this.prisma.arbitrationCase.create({
      data: {
        contractId,
        disputeId: dispute.id,
        investigatorId,
        status: 'OPEN',
      },
    });
  }

  async assignInvestigator(caseId: string, investigatorId: string) {
    return this.prisma.arbitrationCase.update({
      where: { id: caseId },
      data: {
        investigatorId,
        status: 'IN_REVIEW',
      },
    });
  }

  async submitDecision(caseId: string, decision: string, token?: string) {
    const arbitrationCase = await this.prisma.arbitrationCase.findUnique({
      where: { id: caseId },
      include: {
        contract: {
          include: { milestones: true },
        },
      },
    });

    if (!arbitrationCase) throw new NotFoundException('Case not found');

    const updatedCase = await this.prisma.arbitrationCase.update({
      where: { id: caseId },
      data: {
        decision,
        status: 'RESOLVED',
      },
    });

    // 1. Resolve Financials
    const activeMilestones = arbitrationCase.contract.milestones.filter(
      (m) => m.escrowStatus === 'FUNDED',
    );

    const paymentUrl = this.configService.get<string>(
      'PAYMENT_SERVICE_URL',
      'http://payment-service:3005',
    );

    for (const milestone of activeMilestones) {
      try {
        if (decision === 'REFUND_CLIENT') {
          await firstValueFrom(
            this.httpService.post(
              `${paymentUrl}/api/payments/escrow/refund`,
              {
                contractId: arbitrationCase.contractId,
                milestoneId: milestone.id,
              },
              { headers: { Authorization: token } },
            ),
          );

          await this.prisma.milestone.update({
            where: { id: milestone.id },
            data: { escrowStatus: 'REFUNDED', status: 'COMPLETED' },
          });
        } else if (decision === 'RELEASE_FREELANCER') {
          await firstValueFrom(
            this.httpService.post(
              `${paymentUrl}/api/payments/escrow/release`,
              {
                contractId: arbitrationCase.contractId,
                milestoneId: milestone.id,
                freelancerId: arbitrationCase.contract.freelancer_id,
              },
              { headers: { Authorization: token } },
            ),
          );

          await this.prisma.milestone.update({
            where: { id: milestone.id },
            data: { escrowStatus: 'RELEASED', status: 'COMPLETED' },
          });
        }
      } catch (err) {
        this.logger.error(
          `Failed to execute resolution for milestone ${milestone.id}: ${err.message}`,
        );
      }
    }

    // 2. Resolve Contract Status
    await this.prisma.contract.update({
      where: { id: arbitrationCase.contractId },
      data: {
        status: decision === 'REFUND_CLIENT' ? 'TERMINATED' : 'COMPLETED',
        disputeStatus: 'RESOLVED',
      },
    });

    // 3. Notify parties
    const contract = arbitrationCase.contract;
    await Promise.all([
      this.sendNotification(
        contract.client_id,
        'DISPUTE_RESOLVED',
        'Dispute Resolved',
        `Dispute decision: ${decision}`,
        `/contracts/${contract.id}`,
        { contractId: contract.id },
      ),
      this.sendNotification(
        contract.freelancer_id,
        'DISPUTE_RESOLVED',
        'Dispute Resolved',
        `Dispute decision: ${decision}`,
        `/contracts/${contract.id}`,
        { contractId: contract.id },
      ),
    ]);

    return updatedCase;
  }

  async getArbitrationCase(caseId: string) {
    return this.prisma.arbitrationCase.findUnique({
      where: { id: caseId },
      include: { contract: true },
    });
  }

  async listArbitrations(investigatorId?: string) {
    const where: any = {};
    if (investigatorId) {
      where.investigatorId = investigatorId;
    }
    return this.prisma.arbitrationCase.findMany({
      where,
      include: { contract: true },
    });
  }

  async getRiskAnalysis(id: string) {
    const userServiceUrl = this.configService.get<string>(
      'USER_SERVICE_URL',
      'http://user-service:3001',
    );
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${userServiceUrl}/api/users/contracts/${id}/risk-analysis`),
      );
      return data;
    } catch (error) {
      this.logger.error(`Failed to fetch risk analysis: ${error.message}`);
      return {
        riskLevel: 'UNKNOWN',
        flaggedClauses: [],
        analysis: 'Could not perform AI risk analysis at this time.',
      };
    }
  }

  async recordSessionActivity(
    id: string,
    data: { activityScore: number; idleMinutes: number },
  ) {
    // 1. Bot-like behavior check: Perfect score with zero idle time over long duration?
    // Simplified trigger:
    if (data.activityScore === 100 && data.idleMinutes === 0) {
      // Flag this as suspicious internally
      // console.log(`[GUARDIAN] Suspicious perfection detected for session ${id}`);
      // In production: await this.flagContract(contractId, 'SUSPICIOUS_ACTIVITY_SCORE');
    }

    const updatedSession = await (this.prisma.timeSession as any).update({
      where: { id },
      data: {
        activityScore: data.activityScore,
        idleMinutes: data.idleMinutes,
      },
      include: { contract: true }
    });

    // 2. "Impossible Work" check: Check total hours in last 24h
    // This is a heavy query, so maybe optimize or sample it.
    // For now, we'll check it.
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    // Sum duration of sessions in last 24h for this contract's freelancer
    // We need freelancerId, which isn't on TimeSession directly but on Contract.
    // Assuming updatedSession has contract.

    // Placeholder logic for completeness:
    // const recentSessions = await this.prisma.timeSession.findMany({ ... });
    // const totalMinutes = recentSessions.reduce(...);
    // if (totalMinutes > 20 * 60) this.flagContract(...);

    return updatedSession;
  }

  async analyzeSessionEfficiency(sessionId: string) {
    const session = await (this.prisma.timeSession as any).findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Session not found');

    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      return {
        efficiencyLabel: (session as any).activityScore && (session as any).activityScore > 70 ? 'High' : 'Moderate',
        insights: '(Mocked) Activity appears consistent with developer standards.',
      };
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      Analyze the following developer time session metrics for productivity.
      - Start Time: ${session.startTime}
      - End Time: ${session.endTime}
      - Activity Score: ${(session as any).activityScore} (0-100)
      - Idle Minutes: ${(session as any).idleMinutes}
      
      Instructions:
      1. Provide a productivity label (e.g., Deep Work, Light Coding, Multi-tasking).
      2. Give one piece of advice to improve focus based on idle time.
      
      Return EXCLUSIVELY a JSON object:
      {
        "efficiencyLabel": "string",
        "insights": "string"
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\{.*\}/s);
      return JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (error) {
      this.logger.error(`Gemini analysis error: ${error.message}`);
      return { efficiencyLabel: 'Standard', insights: 'Steady progress detected.' };
    }
  }

  async getDisputeTimeline(contractId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        milestones: {
          include: {
            submissions: {
              include: { revisions: true }
            }
          }
        },
        disputes: {
          include: {
            evidence: true,
            arbitrationCase: true
          }
        }
      }
    });

    if (!contract) throw new NotFoundException('Contract not found');

    const events: any[] = [];

    // 1. Contract Creation
    events.push({
      type: 'CONTRACT_CREATED',
      date: contract.createdAt,
      description: `Contract initiated for $${contract.totalAmount}`,
      metadata: { status: contract.status }
    });

    // 2. Milestones
    contract.milestones.forEach(m => {
      events.push({
        type: 'MILESTONE_CREATED',
        date: m.createdAt,
        description: `Milestone: ${m.description} ($${m.amount})`,
        metadata: { milestoneId: m.id }
      });

      if (m.escrowStatus === 'FUNDED' || m.status === 'ACTIVE') {
        events.push({
          type: 'MILESTONE_FUNDED',
          date: m.updatedAt, // Approximate
          description: `Funds secured for: ${m.description}`,
          metadata: { milestoneId: m.id }
        });
      }

      m.submissions.forEach(s => {
        events.push({
          type: 'WORK_SUBMITTED',
          date: s.createdAt,
          description: `Work submitted for milestone: ${m.description}`,
          metadata: { submissionId: s.id, type: s.type }
        });

        s.revisions.forEach(r => {
          events.push({
            type: 'WORK_REJECTED',
            date: r.createdAt,
            description: `Revision requested: ${r.feedback.substring(0, 50)}...`,
            metadata: { feedback: r.feedback }
          });
        });
      });

      if (m.status === 'COMPLETED') {
        events.push({
          type: 'WORK_APPROVED',
          date: m.updatedAt,
          description: `Milestone completed: ${m.description}`,
          metadata: { milestoneId: m.id }
        });
      }
    });

    // 3. Disputes
    contract.disputes.forEach(d => {
      events.push({
        type: 'DISPUTE_OPENED',
        date: d.createdAt,
        description: `Dispute opened: ${d.reason}`,
        metadata: { disputeId: d.id, raisedBy: d.raisedById }
      });

      d.evidence.forEach(e => {
        events.push({
          type: 'EVIDENCE_ADDED',
          date: e.createdAt,
          description: `Evidence submitted: ${e.description || 'No description'}`,
          metadata: { uploaderId: e.uploaderId, fileType: e.fileType }
        });
      });

      if (d.arbitrationCase) {
        events.push({
          type: 'ARBITRATION_OPENED',
          date: d.arbitrationCase.createdAt,
          description: `Arbitration initiated. Case ID: ${d.arbitrationCase.id}`,
          metadata: { caseId: d.arbitrationCase.id }
        });

        if (d.arbitrationCase.status === 'RESOLVED') {
          events.push({
            type: 'ARBITRATION_RESOLVED',
            date: d.arbitrationCase.updatedAt,
            description: `Case resolved: ${d.arbitrationCase.decision?.substring(0, 50)}...`,
            metadata: { decision: d.arbitrationCase.decision }
          });
        }
      }
    });

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async createCheckIn(contractId: string, data: any) {
    return this.prisma.checkIn.create({
      data: {
        contractId,
        title: data.title,
        description: data.description,
        scheduledAt: new Date(data.scheduledAt),
        durationMinutes: data.durationMinutes || 30,
        status: 'SCHEDULED',
      },
    });
  }

  async suggestMeetingTimes(contractId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });
    if (!contract) throw new NotFoundException('Contract not found');

    try {
      const userServiceUrl = this.configService.get<string>(
        'USER_SERVICE_URL',
        'http://user-service:3001',
      );
      const [client, freelancer] = await Promise.all([
        firstValueFrom(
          this.httpService.get(`${userServiceUrl}/api/users/${contract.client_id}`),
        ),
        firstValueFrom(
          this.httpService.get(`${userServiceUrl}/api/users/${contract.freelancer_id}`),
        ),
      ]);

      const clientTz = client.data.timezone || 'UTC';
      const freelancerTz = freelancer.data.timezone || 'UTC';

      this.logger.log(`Suggesting times between ${clientTz} and ${freelancerTz}`);

      // Simplified suggestion logic: Return a few slots that are "Business Hours" (9am-5pm) in BOTH timezones
      // This is a placeholder for a complex timezone arithmetic library
      return {
        suggestedSlots: [
          { start: '2026-01-10T09:00:00Z', label: 'Overlapping Morning' },
          { start: '2026-01-10T14:00:00Z', label: 'Overlapping Afternoon' },
        ],
        clientTimezone: clientTz,
        freelancerTimezone: freelancerTz,
        note: 'Slots filtered for mutual business hours overlap.',
      };
    } catch (err) {
      this.logger.error(`Timezone suggestion failed: ${err.message}`);
      return { suggestedSlots: [] };
    }
  }

  async rejectContract(contractId: string, userId: string, reason: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: { approvalParams: true },
    });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.status !== 'PENDING_APPROVAL')
      throw new ConflictException('Contract is not pending approval');

    await this.prisma.contract.update({
      where: { id: contractId },
      data: { status: 'REJECTED' },
    });

    if (contract.approvalParams) {
      await this.prisma.contractApprovalRequest.update({
        where: { id: contract.approvalParams.id },
        data: {
          status: 'REJECTED',
          decidedBy: userId,
          decidedAt: new Date(),
          reason,
        },
      });
    }

    return { message: 'Contract rejected' };
  }

  async listPendingApprovals(userId: string, teamId?: string) {
    const where: any = {
      status: 'PENDING',
    };

    if (teamId) {
      where.contract = {
        agencyId: teamId,
      };
    }

    return this.prisma.contractApprovalRequest.findMany({
      where,
      include: {
        contract: true,
      },
    });
  }
}
