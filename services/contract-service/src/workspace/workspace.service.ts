import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkspaceService {
  constructor(private prisma: PrismaService) {}

  async getWorkspace(contractId: string) {
    let workspace = await this.prisma.workspace.findUnique({
      where: { contractId },
    });

    // Auto-create workspace if it doesn't exist
    if (!workspace) {
      workspace = await this.createWorkspace(contractId);
    }

    return workspace;
  }

  async createWorkspace(contractId: string) {
    // Verify contract exists
    const contract = await this.prisma.contract.findUnique({
      where: { id: contractId },
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${contractId} not found`);
    }

    return this.prisma.workspace.create({
      data: {
        contractId,
        content: {},
        version: 0,
      },
    });
  }

  async updateWorkspace(contractId: string, content: any, version: number) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { contractId },
    });

    if (!workspace) {
      throw new NotFoundException(
        `Workspace for contract ${contractId} not found`,
      );
    }

    // Optimistic locking: ensure version matches
    if (workspace.version !== version) {
      throw new Error(
        'Version conflict: workspace has been modified by another user',
      );
    }

    return this.prisma.workspace.update({
      where: { contractId },
      data: {
        content,
        version: { increment: 1 },
      },
    });
  }
}
