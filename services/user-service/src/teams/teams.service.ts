import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
            throw new ForbiddenException('Only the owner can update the team/organization');
        }

        return this.prisma.team.update({
            where: { id },
            data: updateTeamDto,
        });
    }

    async addMember(teamId: string, userId: string, inviterId: string) {
        const team = await this.findOne(teamId);

        // Check if inviter is owner or admin in team
        const inviter = team.members.find(m => m.userId === inviterId);
        if (!inviter || (inviter.role !== 'OWNER' && inviter.role !== 'ADMIN')) {
            throw new ForbiddenException('You do not have permission to invite members');
        }

        // Check if user already in team
        const existing = team.members.find(m => m.userId === userId);
        if (existing) {
            throw new ConflictException('User is already a member of this team/organization');
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
        const requester = team.members.find(m => m.userId === requesterId);
        const target = team.members.find(m => m.userId === userId);

        if (!requester || !target) {
            throw new NotFoundException('Requester or target member not found in team');
        }

        const canRemove =
            requesterId === userId || // Self-removal
            requester.role === 'OWNER' || // Owner can remove anyone
            (requester.role === 'ADMIN' && target.role === 'MEMBER'); // Admin can remove members

        if (!canRemove) {
            throw new ForbiddenException('You do not have permission to remove this member');
        }

        if (target.role === 'OWNER' && team.ownerId === userId) {
            throw new ForbiddenException('Owner cannot be removed. Transfer ownership or delete team instead.');
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
}
