import { Injectable } from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) { }

  create(createContractDto: CreateContractDto) {
    return this.prisma.contract.create({
      data: createContractDto,
    });
  }

  findAll() {
    return this.prisma.contract.findMany();
  }

  findOne(id: string) {
    return this.prisma.contract.findUnique({
      where: { id },
      include: { milestones: true },
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
  async submitWork(contractId: string, data: { milestoneId: string; attachments: string[] }) {
    return this.prisma.milestone.update({
      where: { id: data.milestoneId },
      data: { status: 'SUBMITTED' }, // We might need to add SUBMITTED to enum or handle via separate table
    });
  }

  async approveWork(contractId: string, data: { milestoneId: string }) {
    return this.prisma.milestone.update({
      where: { id: data.milestoneId },
      data: { status: 'COMPLETED' },
    });
  }

  disputeContract(id: string, reason: string) {
    return this.prisma.contract.update({
      where: { id },
      data: {
        status: 'DISPUTED',
        disputeStatus: 'OPEN',
        disputeReason: reason,
      },
    });
  }
}
