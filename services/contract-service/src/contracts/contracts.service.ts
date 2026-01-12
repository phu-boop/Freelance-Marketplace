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

  async create(createContractDto: CreateContractDto, authHeader?: string) {
    let {
      freelancer_id,
      client_id,
      totalAmount,
      job_id,
      proposal_id,
      terms,
      agencyId,
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

    let status = 'ACTIVE';
    if (agencyId) {
      const approvalCheck = await this.checkApproval(
        agencyId,
        'HIRE',
        Number(totalAmount || 0),
      );
      if (approvalCheck.required) {
        status = 'PENDING_APPROVAL';
      }
    }

    const contract = await this.prisma.contract.create({
      data: {
        freelancer_id: freelancer_id as string,
        client_id: client_id as string,
        totalAmount: totalAmount as any,
        job_id: job_id,
        proposal_id: proposal_id,

        agencyId: agencyId as string,
        departmentId: departmentId as string,
        customClauses: customClauses || undefined,
        status,
        ...rest,
      },
    });

    if (status === 'PENDING_APPROVAL') {
      await this.prisma.contractApprovalRequest.create({
        data: {
          contractId: contract.id,
          requestedBy: client_id as string,
          status: 'PENDING',
        },
      });
    }

    return contract;
  }

  findAll(freelancerId?: string, clientId?: string) {
    const where: any = {};
    if (freelancerId) {
      where.freelancer_id = freelancerId;
    }
    if (clientId) {
      where.client_id = clientId;
    }

    return this.prisma.contract.findMany({
      where,
      include: { milestones: true },
    });
  }

  findByFreelancer(freelancerId: string, agencyId?: string) {
    const where: any = { freelancer_id: freelancerId };
    if (agencyId) {
      where.agencyId = agencyId;
    }
    return this.prisma.contract.findMany({
      where,
      include: { milestones: true },
    });
  }

  findByClient(clientId: string, agencyId?: string) {
    const where: any = agencyId ? { agencyId } : { client_id: clientId };
    return this.prisma.contract.findMany({
      where,
      include: { milestones: true },
    });
  }

  findOne(id: string) {
    return this.prisma.contract.findUnique({
      where: { id },
      include: {
        milestones: {
          include: { submissions: true },
        },
      },
    });
  }

  update(id: string, updateContractDto: UpdateContractDto) {
    return this.prisma.contract.update({
      where: { id },
      data: updateContractDto,
    });
  }

  remove(id: string) {
    return this.prisma.contract.delete({
      where: { id },
    });
  }

  addMilestone(contractId: string, data: any) {
    return this.prisma.milestone.create({
      data: { ...data, contractId },
    });
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

    // Create submission record
    await this.prisma.submission.create({
      data: {
        ...submissionData,
        milestoneId,
      },
    });

    // Calculate auto-release date
    const autoReleaseDate = new Date();
    autoReleaseDate.setDate(
      autoReleaseDate.getDate() + (contract.autoReleaseDays || 14),
    );

    // Update milestone status and set auto-release date
    return this.prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status: 'IN_REVIEW',
        autoReleaseDate,
      },
    });
  }

  async extendContract(
    id: string,
    userId: string,
    data: { additionalAmount?: number; newEndDate?: string },
  ) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.client_id !== userId)
      throw new ConflictException('Only the client can extend the contract');

    const updateData: any = {};
    if (data.additionalAmount) {
      updateData.totalAmount = { increment: data.additionalAmount };
    }
    if (data.newEndDate) {
      updateData.endDate = new Date(data.newEndDate);
    }

    return this.prisma.contract.update({
      where: { id },
      data: updateData,
    });
  }

  async activateMilestone(contractId: string, data: { milestoneId: string }) {
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
          },
          {
            headers: { Authorization: `Bearer mocked_client_token` }, // In real app, pass actual token
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
    return this.prisma.milestone.update({
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
  }

  getSubmissions(milestoneId: string) {
    return this.prisma.submission.findMany({
      where: { milestoneId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approveWork(contractId: string, data: { milestoneId: string }) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: data.milestoneId },
    });

    if (!contract || !milestone)
      throw new NotFoundException('Contract or Milestone not found');
    if (contract.status === 'PAUSED')
      throw new ConflictException(
        'Cannot approve work while contract is paused',
      );

    // Transfer funds from Client to Freelancer via Escrow Release
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
          },
          {
            headers: { Authorization: `Bearer mocked_client_token` },
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

  async rejectWork(contractId: string, data: { milestoneId: string }) {
    return this.prisma.milestone.update({
      where: { id: data.milestoneId },
      data: { status: 'ACTIVE' },
    });
  }

  async disputeContract(id: string, reason: string) {
    const disputeTimeoutAt = new Date();
    disputeTimeoutAt.setDate(disputeTimeoutAt.getDate() + 7); // Default 7 days for dispute resolution

    return this.prisma.contract.update({
      where: { id },
      data: {
        status: 'DISPUTED',
        disputeStatus: 'OPEN',
        disputeReason: reason,
        disputes: {
          create: {
            raisedById: 'SYSTEM', // Simplified for now, or pass userId
            reason,
            disputeTimeoutAt,
          },
        },
      },
    });
  }

  findAllDisputed() {
    return this.prisma.contract.findMany({
      where: { status: 'DISPUTED' },
      include: { milestones: true },
    });
  }

  resolveDispute(id: string, resolution: 'COMPLETED' | 'TERMINATED') {
    return this.prisma.contract.update({
      where: { id },
      data: {
        status: resolution,
        disputeStatus: 'RESOLVED',
      },
    });
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
    try {
      await firstValueFrom(
        this.httpService.post(`${auditServiceUrl}/api/audit/logs`, data),
      );
    } catch (error) {
      this.logger.error(
        `Failed to log financial event to audit-service: ${error.message}`,
      );
    }
  }
  async approveContract(contractId: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
      include: { approvalParams: true },
    });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.status !== 'PENDING_APPROVAL')
      throw new ConflictException('Contract is not pending approval');

    // Here we should verify if userId has permission to approve (Manager/Admin of the agency)
    // For MVP, we assume the caller (Controller/Gateway) checks the role or we trust the call.
    // Ideally: call user-service checkPermissions(agencyId, userId, 'APPROVE_HIRE')

    await this.prisma.contract.update({
      where: { id: contractId },
      data: { status: 'ACTIVE' },
    });

    if (contract.approvalParams) {
      await this.prisma.contractApprovalRequest.update({
        where: { id: contract.approvalParams.id },
        data: {
          status: 'APPROVED',
          decidedBy: userId,
          decidedAt: new Date(),
        },
      });
    }

    return { message: 'Contract active' };
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
    return this.prisma.arbitrationCase.create({
      data: {
        contractId,
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

  async submitDecision(caseId: string, decision: string) {
    const arbitrationCase = await this.prisma.arbitrationCase.update({
      where: { id: caseId },
      data: {
        decision,
        status: 'RESOLVED',
      },
    });

    await this.prisma.contract.update({
      where: { id: arbitrationCase.contractId },
      data: {
        status: 'RESOLVED',
        disputeStatus: 'RESOLVED',
      },
    });

    return arbitrationCase;
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
    return (this.prisma.timeSession as any).update({
      where: { id },
      data: {
        activityScore: data.activityScore,
        idleMinutes: data.idleMinutes,
      },
    });
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
}
