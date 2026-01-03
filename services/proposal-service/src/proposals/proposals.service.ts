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
    const userServiceUrl = this.configService.get('USER_SERVICE_URL') || 'http://localhost:3001';

    // 1. Deduct connects
    try {
      const res = await fetch(`${userServiceUrl}/api/users/${createProposalDto.freelancer_id}/deduct-connects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: CONNECTS_COST }),
      });

      if (!res.ok) {
        if (res.status === 403) {
          throw new HttpException('Insufficient connects to submit a proposal (Required: 2)', HttpStatus.FORBIDDEN);
        }
        throw new Error(`Failed to deduct connects: ${res.statusText}`);
      }
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error('Connects deduction failed:', error);
      throw new HttpException('Failed to process proposal fee', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 2. Create proposal
    try {
      return await this.prisma.proposal.create({
        data: createProposalDto,
      });
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

  update(id: string, updateProposalDto: UpdateProposalDto) {
    return this.prisma.proposal.update({
      where: { id },
      data: updateProposalDto,
    });
  }

  remove(id: string) {
    return this.prisma.proposal.delete({
      where: { id },
    });
  }
}
