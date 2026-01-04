import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Roles } from 'nest-keycloak-connect';

@Controller('api/user/teams')
export class TeamsController {
    constructor(private readonly teamsService: TeamsService) { }

    @Post()
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] })
    create(@Body() createTeamDto: CreateTeamDto, @Request() req) {
        return this.teamsService.create(req.user.sub, createTeamDto);
    }

    @Get()
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] })
    findAll(@Request() req) {
        return this.teamsService.findAllForUser(req.user.sub);
    }

    @Get(':id')
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] })
    findOne(@Param('id') id: string) {
        return this.teamsService.findOne(id);
    }

    @Patch(':id')
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] })
    update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto, @Request() req) {
        return this.teamsService.update(id, req.user.sub, updateTeamDto);
    }

    @Post(':id/members')
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] })
    addMember(@Param('id') id: string, @Body('userId') userId: string, @Request() req) {
        return this.teamsService.addMember(id, userId, req.user.sub);
    }

    @Delete(':id/members/:userId')
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] })
    removeMember(@Param('id') id: string, @Param('userId') userId: string, @Request() req) {
        return this.teamsService.removeMember(id, userId, req.user.sub);
    }
}
