import { Injectable, NotFoundException } from '@nestjs/common';
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

  // Work submission logic would typically involve updating a milestone status or creating a submission record
  // For MVP, let's assume it updates the active milestone status
  async submitWork(contractId: string, data: { milestoneId: string; content: string; attachments: string[]; type: 'PROGRESS_REPORT' | 'FINAL_RESULT' }) {
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
    return this.prisma.timeLog.create({
      data: {
        contractId,
        hours: data.hours,
        description: data.description,
        date: new Date(data.date),
      },
    });
  }

  async getTimeLogs(contractId: string) {
    return this.prisma.timeLog.findMany({
      where: { contractId },
      orderBy: { date: 'desc' },
    });
  }

  async approveTimeLog(id: string) {
    const log = await this.prisma.timeLog.findUnique({
      where: { id },
      include: { contract: true },
    });

    if (!log || !log.contract) throw new NotFoundException('Time log or contract not found');

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
}
