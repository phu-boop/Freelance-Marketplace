import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Public, Roles } from 'nest-keycloak-connect';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { UpdateProposalDto } from './dto/update-proposal.dto';

@Controller('api/proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) { }

  @Get('sync')
  @Public()
  sync(
    @Query('since') since: string,
    @Query('entities') entities: string,
  ) {
    const entityList = entities ? entities.split(',') : ['Proposal'];
    return this.proposalsService.sync(since || new Date(0).toISOString(), entityList);
  }

  @Post()
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
  create(@Body() createProposalDto: CreateProposalDto) {
    return this.proposalsService.create(createProposalDto);
  }

  @Get()
  findAll(
    @Query('freelancerId') freelancerId?: string,
    @Query('jobId') jobId?: string,
  ) {
    if (freelancerId) return this.proposalsService.findByFreelancer(freelancerId);
    if (jobId) return this.proposalsService.findByJob(jobId);
    return this.proposalsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proposalsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProposalDto: UpdateProposalDto) {
    return this.proposalsService.update(id, updateProposalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.proposalsService.remove(id);
  }
}
