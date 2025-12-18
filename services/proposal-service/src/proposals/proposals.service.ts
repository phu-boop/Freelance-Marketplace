import { Injectable } from '@nestjs/common';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProposalsService {
  constructor(private prisma: PrismaService) { }

  create(createProposalDto: CreateProposalDto) {
    return this.prisma.proposal.create({
      data: createProposalDto,
    });
  }

  findAll() {
    return this.prisma.proposal.findMany();
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
