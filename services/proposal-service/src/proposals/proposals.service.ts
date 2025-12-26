import { Injectable } from '@nestjs/common';
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

  create(createProposalDto: CreateProposalDto) {
    return this.prisma.proposal.create({
      data: createProposalDto,
    });
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
