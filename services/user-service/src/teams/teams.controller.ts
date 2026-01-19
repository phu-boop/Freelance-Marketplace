import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Roles, Public } from 'nest-keycloak-connect';

@Controller('api/user/teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) { }

  @Post()
  @Roles({
    roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'],
  })
  create(@Body() createTeamDto: CreateTeamDto, @Request() req) {
    return this.teamsService.create(req.user.sub, createTeamDto);
  }

  @Get()
  @Roles({
    roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'],
  })
  findAll(@Request() req) {
    return this.teamsService.findAllForUser(req.user.sub);
  }

  @Get(':id')
  @Roles({
    roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'],
  })
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Patch(':id')
  @Roles({
    roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'],
  })
  update(
    @Param('id') id: string,
    @Body() updateTeamDto: UpdateTeamDto,
    @Request() req,
  ) {
    return this.teamsService.update(id, req.user.sub, updateTeamDto);
  }

  @Post(':id/members')
  @Roles({
    roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'],
  })
  addMember(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Request() req,
  ) {
    return this.teamsService.addMember(id, userId, req.user.sub);
  }

  @Delete(':id/members/:userId')
  @Roles({
    roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'],
  })
  removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    return this.teamsService.removeMember(id, userId, req.user.sub);
  }

  @Post(':id/policies')
  @Roles({
    roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'],
  })
  setPolicy(
    @Param('id') id: string,
    @Body()
    body: { triggerType: string; minAmount?: number; requiredRoles: string[] },
    @Request() req,
  ) {
    return this.teamsService.setPolicy(id, req.user.sub, body);
  }

  @Get(':id/policies')
  @Roles({
    roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'],
  })
  getPolicies(@Param('id') id: string, @Request() req) {
    return this.teamsService.getPolicies(id, req.user.sub);
  }

  @Get(':id/policies/check')
  checkApproval(
    @Param('id') id: string,
    @Query('type') type: string,
    @Query('amount') amount: number,
  ) {
    return this.teamsService.checkApprovalRequired(id, type, amount);
  }

  @Post(':id/departments/:deptId/increment-spend')
  incrementDepartmentSpend(
    @Param('id') id: string,
    @Param('deptId') deptId: string,
    @Body('amount') amount: number,
  ) {
    return this.teamsService.incrementDepartmentSpend(id, deptId, amount);
  }

  @Post(':id/departments')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  createDepartment(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { name: string; code?: string; budget?: number },
  ) {
    return this.teamsService.createDepartment(id, req.user.sub, body);
  }

  @Get(':id/departments')
  @Roles({
    roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'],
  })
  getDepartments(@Param('id') id: string, @Request() req) {
    return this.teamsService.getDepartments(id, req.user.sub);
  }

  @Post(':id/sso')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  setSSOConfig(
    @Param('id') id: string,
    @Body() body: { domain: string },
    @Request() req,
  ) {
    return this.teamsService.setSSOConfig(id, req.user.sub, body.domain);
  }

  @Get(':id/sso')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  getSSOConfig(@Param('id') id: string, @Request() req) {
    return this.teamsService.getSSOConfig(id, req.user.sub);
  }

  @Post(':id/clauses')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  createClause(
    @Param('id') id: string,
    @Body() body: { title: string; content: string; isDefault?: boolean },
    @Request() req,
  ) {
    return this.teamsService.createClause(id, req.user.sub, body);
  }

  @Get(':id/clauses')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  getClauses(@Param('id') id: string, @Request() req) {
    return this.teamsService.getClauses(id, req.user.sub);
  }

  @Public()
  @Get('internal/primary/:userId')
  async getPrimaryTeam(@Param('userId') userId: string) {
    const teams = await this.teamsService.findAllForUser(userId);
    return teams[0] || null;
  }
}
