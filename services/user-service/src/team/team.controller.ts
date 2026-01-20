import { Controller, Get, Post, Patch, Delete, Param, Body, NotFoundException } from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto, UpdateTeamDto } from './dto';

@Controller('api/teams')
export class TeamController {
    constructor(private readonly teamService: TeamService) { }

    @Post()
    async create(@Body() createTeamDto: CreateTeamDto) {
        return this.teamService.create(createTeamDto);
    }

    @Get()
    async findAll() {
        return this.teamService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const team = await this.teamService.findOne(id);
        if (!team) {
            throw new NotFoundException(`Team with id ${id} not found`);
        }
        return team;
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
        return this.teamService.update(id, updateTeamDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.teamService.remove(id);
    }
}
