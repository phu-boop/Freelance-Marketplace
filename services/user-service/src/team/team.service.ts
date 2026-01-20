import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto, UpdateTeamDto } from './dto';

@Injectable()
export class TeamService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createTeamDto: CreateTeamDto) {
        return this.prisma.team.create({ data: createTeamDto });
    }

    async findAll() {
        return this.prisma.team.findMany();
    }

    async findOne(id: string) {
        const team = await this.prisma.team.findUnique({ where: { id } });
        if (!team) {
            throw new NotFoundException(`Team with id ${id} not found`);
        }
        return team;
    }

    async update(id: string, updateTeamDto: UpdateTeamDto) {
        return this.prisma.team.update({ where: { id }, data: updateTeamDto });
    }

    async remove(id: string) {
        return this.prisma.team.delete({ where: { id } });
    }
}
