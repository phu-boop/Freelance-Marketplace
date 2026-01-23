import { Injectable, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProposalsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) { }

  async create(createProposalDto: CreateProposalDto) {
    const CONNECTS_COST = 2;
    const boostAmount = createProposalDto.boostAmount || 0;
    const totalConnects = CONNECTS_COST + boostAmount;

    const paymentServiceUrl = this.configService.get('PAYMENT_SERVICE_URL') || 'http://payment-service:3005';

    // 1. Deduct connects
    try {
      const res = await fetch(`${paymentServiceUrl}/api/payments/connects/deduct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: createProposalDto.freelancerId,
          amount: totalConnects,
          reason: `Proposal submission for job ${createProposalDto.jobId}${boostAmount > 0 ? ' (Boosted)' : ''}`
        }),
      });

      if (!res.ok) {
        if (res.status === 400 || res.status === 403) {
          throw new HttpException(`Insufficient connects to submit a proposal (Required: ${totalConnects})`, HttpStatus.FORBIDDEN);
        }
        throw new Error(`Failed to deduct connects from payment service: ${res.statusText}`);
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('Connects deduction failed:', error);
      throw new HttpException('Failed to process proposal fee', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 2. Create proposal
    try {
      const { jobId, freelancerId, ...rest } = createProposalDto;
      const proposal = await this.prisma.proposal.create({
        data: {
          ...rest,
          job_id: jobId,
          freelancer_id: freelancerId,
          isBoosted: boostAmount > 0,
        },
      });

      this.trackEvent('proposal_sent', createProposalDto.freelancerId, createProposalDto.jobId, {
        isBoosted: boostAmount > 0,
        boostAmount,
      });

      return proposal;
    } catch (error) {
      // Prisma error code P2002: Unique constraint failed
      if (error.code === 'P2002') {
        throw new ConflictException('You have already submitted a proposal for this job.');
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.proposal.findMany();
  }

  findByFreelancer(freelancerId: string) {
    return this.prisma.proposal.findMany({
      where: { freelancer_id: freelancerId },
    });
  }

  async findByJob(jobId: string) {
    const proposals = await this.prisma.proposal.findMany({
      where: { job_id: jobId },
      orderBy: [
        { isBoosted: 'desc' },
        { boostAmount: 'desc' },
        { createdAt: 'desc' }
      ],
    });

    const enrichedProposals = await Promise.all(proposals.map(async (p) => {
      try {
        const userServiceUrl = this.configService.get('USER_SERVICE_URL') || 'http://localhost:3001';
        const res = await fetch(`${userServiceUrl}/users/${p.freelancer_id}`);
        if (res.ok) {
          const user = await res.json();
          return {
            ...p,
            freelancerName: `${user.firstName} ${user.lastName}`,
            freelancerTitle: user.profile?.title || 'Freelancer',
          };
        }
      } catch (e) {
        console.error('Failed to fetch user details', e);
      }
      return {
        ...p,
        freelancerName: 'Unknown Freelancer',
        freelancerTitle: 'Freelancer',
      };
    }));

    return enrichedProposals;
  }

  findOne(id: string) {
    return this.prisma.proposal.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateProposalDto: UpdateProposalDto) {
    const proposal = await this.prisma.proposal.findUnique({ where: { id } });
    if (!proposal) {
      throw new HttpException('Proposal not found', HttpStatus.NOT_FOUND);
    }

    if (updateProposalDto.baseVersion) {
      const clientBaseVersion = new Date(updateProposalDto.baseVersion).getTime();
      const serverBaseVersion = new Date(proposal.updatedAt).getTime();
      if (clientBaseVersion < serverBaseVersion) {
        throw new ConflictException('Conflict detected: The record has been modified by another source.');
      }
    }

    const { baseVersion, ...data } = updateProposalDto;
    const updated = await this.prisma.proposal.update({
      where: { id },
      data,
    });

    if (data.status === 'ACCEPTED' && proposal.status !== 'ACCEPTED') {
      this.trackEvent('proposal_accepted', proposal.freelancer_id, proposal.job_id);
    }

    return updated;
  }

  async remove(id: string) {
    const result = await this.prisma.proposal.delete({
      where: { id },
    });
    await this.recordTombstone('Proposal', id);
    return result;
  }

  private async recordTombstone(entity: string, recordId: string) {
    try {
      await this.prisma.syncTombstone.create({
        data: { entity, recordId }
      });
    } catch (error) {
      console.error(`Failed to record tombstone for ${entity}:${recordId}: ${error.message}`);
    }
  }

  async sync(since: string, entities: string[]) {
    const sinceDate = new Date(since);
    const newSince = new Date();
    const result: any = {
      newSince: newSince.toISOString(),
      upserted: {},
      deleted: {},
    };

    if (entities.includes('Proposal')) {
      result.upserted.proposals = await this.prisma.proposal.findMany({
        where: { updatedAt: { gt: sinceDate } },
      });
      const tombstones = await this.prisma.syncTombstone.findMany({
        where: { entity: 'Proposal', deletedAt: { gt: sinceDate } },
        select: { recordId: true },
      });
      result.deleted.proposals = tombstones.map(t => t.recordId);
    }

    return result;
  }

  private async trackEvent(eventType: string, userId: string, jobId?: string, metadata: any = {}) {
    try {
      const analyticsUrl = process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:3014';
      await fetch(`${analyticsUrl}/api/analytics/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          user_id: userId,
          job_id: jobId || '',
          metadata: JSON.stringify(metadata)
        }),
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }
}
