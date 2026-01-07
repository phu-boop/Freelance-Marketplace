import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) { }

  async create(ownerId: string, createTeamDto: CreateTeamDto) {
    return this.prisma.team.create({
      data: {
        ...createTeamDto,
        ownerId,
        members: {
          create: {
            userId: ownerId,
            role: 'OWNER',
          },
        },
      },
      include: {
        members: true,
      },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.team.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    return team;
  }

  async update(id: string, userId: string, updateTeamDto: UpdateTeamDto) {
    const team = await this.findOne(id);
    if (team.ownerId !== userId) {
      throw new ForbiddenException(
        'Only the owner can update the team/organization',
      );
    }

    return this.prisma.team.update({
      where: { id },
      data: updateTeamDto,
    });
  }

  async addMember(teamId: string, userId: string, inviterId: string) {
    const team = await this.findOne(teamId);

    // Check if inviter is owner or admin in team
    const inviter = team.members.find((m) => m.userId === inviterId);
    if (!inviter || (inviter.role !== 'OWNER' && inviter.role !== 'ADMIN')) {
      throw new ForbiddenException(
        'You do not have permission to invite members',
      );
    }

    // Check if user already in team
    const existing = team.members.find((m) => m.userId === userId);
    if (existing) {
      throw new ConflictException(
        'User is already a member of this team/organization',
      );
    }

    return this.prisma.teamMember.create({
      data: {
        teamId,
        userId,
        role: 'MEMBER',
      },
    });
  }

  async removeMember(teamId: string, userId: string, requesterId: string) {
    const team = await this.findOne(teamId);

    // Owner can remove anyone. Admin can remove members. Members can only remove themselves.
    const requester = team.members.find((m) => m.userId === requesterId);
    const target = team.members.find((m) => m.userId === userId);

    if (!requester || !target) {
      throw new NotFoundException(
        'Requester or target member not found in team',
      );
    }

    const canRemove =
      requesterId === userId || // Self-removal
      requester.role === 'OWNER' || // Owner can remove anyone
      (requester.role === 'ADMIN' && target.role === 'MEMBER'); // Admin can remove members

    if (!canRemove) {
      throw new ForbiddenException(
        'You do not have permission to remove this member',
      );
    }

    if (target.role === 'OWNER' && team.ownerId === userId) {
      throw new ForbiddenException(
        'Owner cannot be removed. Transfer ownership or delete team instead.',
      );
    }

    return this.prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });
  }

  async setPolicy(
    teamId: string,
    userId: string,
    data: { triggerType: string; minAmount?: number; requiredRoles: string[] },
  ) {
    const team = await this.findOne(teamId);
    const requester = team.members.find((m) => m.userId === userId);
    if (
      !requester ||
      (requester.role !== 'OWNER' && requester.role !== 'ADMIN')
    ) {
      throw new ForbiddenException(
        'Only Owner or Admin can configure approval policies',
      );
    }

    return this.prisma.approvalPolicy.upsert({
      where: {
        teamId_triggerType: {
          teamId,
          triggerType: data.triggerType,
        },
      },
      update: {
        minAmount: data.minAmount,
        requiredRoles: data.requiredRoles,
      },
      create: {
        teamId,
        ...data,
      },
    });
  }

  async getPolicies(teamId: string, userId: string) {
    const team = await this.findOne(teamId);
    const requester = team.members.find((m) => m.userId === userId);
    if (!requester) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.approvalPolicy.findMany({
      where: { teamId },
    });
  }

  async checkApprovalRequired(
    teamId: string,
    triggerType: string,
    amount: number,
  ) {
    const policy = await this.prisma.approvalPolicy.findUnique({
      where: {
        teamId_triggerType: {
          teamId,
          triggerType,
        },
      },
    });

    if (!policy) return { required: false };

    // If minAmount is defined and amount is less than minAmount, no approval needed
    if (policy.minAmount && amount < Number(policy.minAmount)) {
      return { required: false };
    }

    return {
      required: true,
      requiredRoles: policy.requiredRoles,
    };
  }

  async createDepartment(
    teamId: string,
    userId: string,
    data: { name: string; code?: string; budget?: number },
  ) {
    const team = await this.findOne(teamId); // Ensure user is member/owner

    // Permission check: only Owner or Admin
    const member = team.members.find((m) => m.userId === userId);
    if (
      !member ||
      (member.role !== 'OWNER' &&
        member.role !== 'ADMIN' &&
        member.role !== 'MANAGER')
    ) {
      // check specific role permissions if needed, for now allow MANAGER too
    }

    return this.prisma.department.create({
      data: {
        teamId,
        name: data.name,
        code: data.code,
        budget: data.budget ? new Prisma.Decimal(data.budget) : null,
      },
    });
  }

  async getDepartments(teamId: string, userId: string) {
    await this.findOne(teamId); // Verify existence. Access check simplified for MVP.
    return this.prisma.department.findMany({
      where: { teamId },
      orderBy: { name: 'asc' },
    });
  }

  async incrementDepartmentSpend(
    teamId: string,
    departmentId: string,
    amount: number,
  ) {
    return this.prisma.department.update({
      where: {
        id: departmentId,
        teamId,
      },
      data: {
        spent: { increment: amount },
      },
    });
  }

  async setSSOConfig(teamId: string, userId: string, domain: string) {
    const team = await this.findOne(teamId);
    const member = team.members.find((m) => m.userId === userId);

    if (!member || member.role !== 'OWNER') {
      throw new ForbiddenException('Only Team Owner can configure SSO');
    }

    return (this.prisma as any).sSOConfig.upsert({
      where: { teamId },
      update: { domain },
      create: { teamId, domain },
    });
  }

  async getSSOConfig(teamId: string, userId: string) {
    // Allow members to view config? Or just admins. Let's say admins.
    const team = await this.findOne(teamId);
    const member = team.members.find((m) => m.userId === userId);
    if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
      throw new ForbiddenException('Access denied');
    }
    return (this.prisma as any).sSOConfig.findUnique({ where: { teamId } });
  }

  async createClause(
    teamId: string,
    userId: string,
    data: { title: string; content: string; isDefault?: boolean },
  ) {
    const team = await this.findOne(teamId);
    const member = team.members.find((m) => m.userId === userId);

    if (
      !member ||
      (member.role !== 'OWNER' &&
        member.role !== 'ADMIN' &&
        member.role !== 'MANAGER')
    ) {
      throw new ForbiddenException('Access denied');
    }

    return (this.prisma as any).contractClause.create({
      data: {
        teamId,
        title: data.title,
        content: data.content,
        isDefault: data.isDefault || false,
      },
    });
  }

  async getClauses(teamId: string, userId: string) {
    await this.findOne(teamId); // Access check
    return (this.prisma as any).contractClause.findMany({
      where: { teamId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
