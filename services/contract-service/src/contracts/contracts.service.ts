import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContractsService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private configService: ConfigService
  ) { }

  create(createContractDto: CreateContractDto) {
    return this.prisma.contract.create({
      data: createContractDto,
    });
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
      include: { milestones: true }
    });
  }

  findByFreelancer(freelancerId: string) {
    return this.prisma.contract.findMany({
      where: { freelancer_id: freelancerId },
      include: { milestones: true }
    });
  }

  findByClient(clientId: string) {
    return this.prisma.contract.findMany({
      where: { client_id: clientId },
      include: { milestones: true }
    });
  }

  findOne(id: string) {
    return this.prisma.contract.findUnique({
      where: { id },
      include: {
        milestones: {
          include: { submissions: true }
        }
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
    if (contract.client_id !== userId) throw new ConflictException('Only the client can pause the contract');
    if (contract.status !== 'ACTIVE') throw new ConflictException('Only active contracts can be paused');

    return this.prisma.contract.update({
      where: { id },
      data: { status: 'PAUSED' }
    });
  }

  async resumeContract(id: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.client_id !== userId) throw new ConflictException('Only the client can resume the contract');
    if (contract.status !== 'PAUSED') throw new ConflictException('Contract is not paused');

    return this.prisma.contract.update({
      where: { id },
      data: { status: 'ACTIVE' }
    });
  }

  // Work submission logic would typically involve updating a milestone status or creating a submission record
  // For MVP, let's assume it updates the active milestone status
  async submitWork(contractId: string, data: { milestoneId: string; content: string; attachments: string[]; type: 'PROGRESS_REPORT' | 'FINAL_RESULT' }) {
    const contract = await this.prisma.contract.findUnique({ where: { id: contractId } });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.status === 'PAUSED') throw new ConflictException('Cannot submit work while contract is paused');

    const { milestoneId, ...submissionData } = data;

    // Create submission record
    await this.prisma.submission.create({
      data: {
        ...submissionData,
        milestoneId,
      },
    });

    // Update milestone status
    return this.prisma.milestone.update({
      where: { id: milestoneId },
      data: { status: 'IN_REVIEW' },
    });
  }

  async extendContract(id: string, userId: string, data: { additionalAmount?: number; newEndDate?: string }) {
    const contract = await this.prisma.contract.findUnique({ where: { id } });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.client_id !== userId) throw new ConflictException('Only the client can extend the contract');

    const updateData: any = {};
    if (data.additionalAmount) {
      updateData.totalAmount = { increment: data.additionalAmount };
    }
    if (data.newEndDate) {
      updateData.endDate = new Date(data.newEndDate);
    }

    return this.prisma.contract.update({
      where: { id },
      data: updateData
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

    if (!contract || !milestone) throw new NotFoundException('Contract or Milestone not found');
    if (contract.status === 'PAUSED') throw new ConflictException('Cannot approve work while contract is paused');

    // Transfer funds from Client to Freelancer
    try {
      const paymentServiceUrl = this.configService.get<string>('PAYMENT_SERVICE_URL', 'http://payment-service:3005');
      await firstValueFrom(
        this.httpService.post(`${paymentServiceUrl}/transfer`, {
          fromUserId: contract.client_id,
          toUserId: contract.freelancer_id,
          amount: Number(milestone.amount),
          description: `Milestone Payment: ${milestone.description}`,
        })
      );
    } catch (error) {
      console.error('Payment transfer failed', error.message);
      throw new Error('Payment transfer failed. Please ensure client has sufficient funds.');
    }

    return this.prisma.milestone.update({
      where: { id: data.milestoneId },
      data: { status: 'COMPLETED' },
    });
  }

  async rejectWork(contractId: string, data: { milestoneId: string }) {
    return this.prisma.milestone.update({
      where: { id: data.milestoneId },
      data: { status: 'ACTIVE' },
    });
  }

  async disputeContract(id: string, reason: string) {
    return this.prisma.contract.update({
      where: { id },
      data: {
        status: 'DISPUTED',
        disputeStatus: 'OPEN',
        disputeReason: reason,
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

  // Time Tracking
  async logTime(contractId: string, data: { hours: number; description: string; date: string }) {
    const contract = await this.prisma.contract.findUnique({ where: { id: contractId } });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.status === 'PAUSED') throw new ConflictException('Cannot log time while contract is paused');

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

    if (!log || !log.contract) throw new NotFoundException('Time log or contract not found');
    if (log.contract.client_id !== userId) throw new ForbiddenException('Only client can approve time logs');
    if (log.status !== 'PENDING') throw new ConflictException(`Time log is already ${log.status}`);

    // In a real app, calculate amount based on hourly rate
    // For MVP, assume rate is stored in contract or just use a fixed rate
    // Let's assume contract.totalAmount is the hourly rate for hourly contracts
    const amount = Number(log.hours) * Number(log.contract.totalAmount);

    // Transfer funds
    try {
      const paymentServiceUrl = this.configService.get<string>('PAYMENT_SERVICE_URL', 'http://payment-service:3005');
      await firstValueFrom(
        this.httpService.post(`${paymentServiceUrl}/transfer`, {
          fromUserId: log.contract.client_id,
          toUserId: log.contract.freelancer_id,
          amount,
          description: `Hourly Payment: ${log.hours} hours on ${log.date.toDateString()}`,
        })
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

    if (!log || !log.contract) throw new NotFoundException('Time log or contract not found');
    if (log.contract.client_id !== userId) throw new ForbiddenException('Only client can reject time logs');
    if (log.status !== 'PENDING') throw new ConflictException(`Time log is already ${log.status}`);

    return this.prisma.timeLog.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
      },
    });
  }

  async startTimer(contractId: string, description?: string) {
    const contract = await this.prisma.contract.findUnique({ where: { id: contractId } });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.status === 'PAUSED') throw new ConflictException('Cannot start timer while contract is paused');

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
    if (hours > 0.01) { // Only log if significant duration (>36s)
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
    const contract = await this.prisma.contract.findUnique({ where: { id: contractId } });
    if (!contract) throw new NotFoundException('Contract not found');

    if (contract.client_id !== userId && contract.freelancer_id !== userId) {
      throw new ForbiddenException('Only contract participants can view time logs');
    }

    return this.prisma.timeLog.findMany({
      where: { contractId },
      orderBy: { date: 'desc' },
    });
  }

  // Check-ins
  async scheduleCheckIn(contractId: string, data: { title: string; description?: string; scheduledAt: string; durationMinutes?: number }, userId: string) {
    const contract = await this.prisma.contract.findUnique({ where: { id: contractId } });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.client_id !== userId && contract.freelancer_id !== userId) {
      throw new ForbiddenException('Only contract participants can schedule check-ins');
    }

    const checkIn = await this.prisma.checkIn.create({
      data: {
        ...data,
        scheduledAt: new Date(data.scheduledAt),
        contractId,
      },
    });

    // Notify other party
    const targetUserId = userId === contract.client_id ? contract.freelancer_id : contract.client_id;
    await this.sendNotification(
      targetUserId,
      'CHECKIN_SCHEDULED',
      'Check-in Scheduled',
      `A new check-in "${data.title}" has been scheduled for ${new Date(data.scheduledAt).toLocaleString()}.`,
      { contractId, checkInId: checkIn.id }
    );

    return checkIn;
  }

  async getCheckIns(contractId: string, userId: string) {
    const contract = await this.prisma.contract.findUnique({ where: { id: contractId } });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.client_id !== userId && contract.freelancer_id !== userId) {
      throw new ForbiddenException('Only contract participants can view check-ins');
    }

    return this.prisma.checkIn.findMany({
      where: { contractId },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async startCheckInMeeting(id: string, userId: string) {
    const checkIn = await this.prisma.checkIn.findUnique({
      where: { id },
      include: { contract: true }
    });
    if (!checkIn) throw new NotFoundException('Check-in not found');

    if (checkIn.contract.client_id !== userId && checkIn.contract.freelancer_id !== userId) {
      throw new ForbiddenException('Only participants can start the meeting');
    }

    const meetingLink = `https://meet.jit.si/freelance-marketplace-checkin-${id}`;

    const updated = await this.prisma.checkIn.update({
      where: { id },
      data: { meetingLink, status: 'IN_PROGRESS' }
    });

    // Notify other party
    const targetUserId = userId === checkIn.contract.freelancer_id ? checkIn.contract.client_id : checkIn.contract.freelancer_id;
    await this.sendNotification(
      targetUserId,
      'CHECKIN_STARTED',
      'Check-in Meeting Started',
      `The video call for check-in "${checkIn.title}" has started.`,
      { contractId: checkIn.contractId, checkInId: id, meetingLink }
    );

    return updated;
  }

  // Contract Templates
  async createTemplate(clientId: string, data: { name: string; description?: string; content: string }) {
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
    if (template.clientId !== clientId) throw new ForbiddenException('Access denied');
    return template;
  }

  async deleteTemplate(id: string, clientId: string) {
    const template = await this.prisma.contractTemplate.findUnique({
      where: { id },
    });
    if (!template) throw new NotFoundException('Template not found');
    if (template.clientId !== clientId) throw new ForbiddenException('Access denied');

    return this.prisma.contractTemplate.delete({
      where: { id },
    });
  }

  async autoReleaseMilestones() {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // Find milestones that are IN_REVIEW
    const milestones = await this.prisma.milestone.findMany({
      where: {
        status: 'IN_REVIEW',
      },
      include: {
        contract: true,
        submissions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const released = [];
    for (const milestone of milestones) {
      const latestSubmission = milestone.submissions[0];
      // Check if latest submission is older than 14 days
      if (latestSubmission && latestSubmission.createdAt < fourteenDaysAgo) {
        try {
          // Process Payout
          const paymentServiceUrl = this.configService.get<string>('PAYMENT_SERVICE_URL', 'http://payment-service:3005');
          await firstValueFrom(
            this.httpService.post(`${paymentServiceUrl}/transfer`, {
              fromUserId: milestone.contract.client_id,
              toUserId: milestone.contract.freelancer_id,
              amount: Number(milestone.amount),
              description: `Auto-Release Payment: ${milestone.description}`,
            })
          );

          // Update Status
          await this.prisma.milestone.update({
            where: { id: milestone.id },
            data: { status: 'COMPLETED' },
          });

          released.push(milestone.id);

          // Notify Client
          await this.sendNotification(
            milestone.contract.client_id,
            'MILESTONE_AUTO_RELEASED',
            'Milestone Auto-Released',
            `Milestone "${milestone.description}" was automatically released after 14 days of inactivity.`,
            { contractId: milestone.contractId, milestoneId: milestone.id }
          );

          // Notify Freelancer
          await this.sendNotification(
            milestone.contract.freelancer_id,
            'MILESTONE_AUTO_RELEASED',
            'Milestone Auto-Released',
            `Payment for milestone "${milestone.description}" has been released automatically.`,
            { contractId: milestone.contractId, milestoneId: milestone.id }
          );

        } catch (error) {
          console.error(`Failed to auto-release milestone ${milestone.id}`, error);
        }
      }
    }

    return { releasedCount: released.length, releasedIds: released };
  }

  private async sendNotification(userId: string, type: string, title: string, message: string, metadata?: any) {
    try {
      const notificationUrl = this.configService.get<string>('NOTIFICATION_SERVICE_URL', 'http://notification-service:3007');
      await firstValueFrom(
        this.httpService.post(`${notificationUrl}/api/notifications`, {
          userId,
          type,
          title,
          message,
          metadata
        })
      );
    } catch (error) {
      console.error('Failed to send notification', error.message);
    }
  }

  async getClientStats(userId: string) {
    const [activeContracts, completedContracts, totalSpentResult] = await Promise.all([
      this.prisma.contract.count({ where: { client_id: userId, status: 'ACTIVE' } }),
      this.prisma.contract.count({ where: { client_id: userId, status: 'COMPLETED' } }),
      this.prisma.contract.aggregate({
        where: { client_id: userId },
        _sum: { totalAmount: true }
      })
    ]);

    return {
      activeContracts,
      completedContracts,
      totalSpent: totalSpentResult._sum.totalAmount || 0,
    };
  }
}
