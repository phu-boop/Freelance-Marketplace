import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { AiService } from './ai.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { CreateCategoryDto } from '../categories/create-category.dto';
import { Public, Roles, AuthenticatedUser } from 'nest-keycloak-connect';

@Controller('api/jobs')
export class JobsController {
  constructor(
    private readonly jobsService: JobsService,
    private readonly aiService: AiService
  ) { }

  @Post('ai/scope')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  async generateAiScope(@Body() body: { description: string, budget?: number }) {
    return this.aiService.generateMilestones(body.description, body.budget);
  }

  @Post('ai/analyze-style')
  @Public() // Allow internal calls or from other services without specific user context if needed
  async analyzeCommunicationStyle(@Body() body: { messages: string[] }) {
    const style = await this.aiService.analyzeCommunicationStyle(body.messages);
    return { style };
  }

  @Post(':id/ai/generate-proposal')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
  async generateAiProposal(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    return this.aiService.generateProposal(id, userId);
  }

  @Post('contracts/:contractId/ai/standup')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] })
  async generateDailyStandup(@Param('contractId') contractId: string, @Body() body: { messages: string[] }) {
    return this.aiService.generateDailyStandup(contractId, body.messages);
  }

  @Post('ai/detect-fraud')
  @Public()
  async detectFraud(@Body() body: { content: string }) {
    return this.aiService.detectFraud(body.content);
  }

  @Post()
  @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:ADMIN', 'ADMIN'] })
  create(@Body() createJobDto: CreateJobDto, @Request() req) {
    console.log('DEBUG: Create Job Request User:', JSON.stringify(req.user));
    return this.jobsService.create(createJobDto);
  }

  @Public()
  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.jobsService.findAll(Number(page), Number(limit));
  }

  @Get('my-jobs')
  findByClient(@Request() req, @Query('status') status?: string, @Query('teamId') teamId?: string) {
    const userId = req.user.sub;
    return this.jobsService.findByClient(userId, status, teamId);
  }

  // Saved Jobs
  @Get('saved')
  getSavedJobs(@Request() req) {
    const userId = req.user.sub;
    return this.jobsService.getSavedJobs(userId);
  }

  @Post(':id/save')
  saveJob(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    return this.jobsService.saveJob(userId, id);
  }

  @Delete(':id/unsave')
  unsaveJob(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    return this.jobsService.unsaveJob(userId, id);
  }

  // Categories
  @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
  @Post('categories')
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.jobsService.createCategory(createCategoryDto);
  }

  @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
  @Post('sync')
  syncAllJobs() {
    return this.jobsService.syncAllJobs();
  }

  @Public()
  @Get('categories')
  findAllCategories() {
    return this.jobsService.findAllCategories();
  }

  @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.jobsService.deleteCategory(id);
  }

  @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() body: { name?: string; parentId?: string }) {
    return this.jobsService.updateCategory(id, body);
  }

  // Skills
  @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
  @Post('skills')
  createSkill(@Body('name') name: string) {
    return this.jobsService.createSkill(name);
  }

  @Public()
  @Get('skills')
  findAllSkills() {
    return this.jobsService.findAllSkills();
  }

  @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
  @Delete('skills/:id')
  deleteSkills(@Param('id') id: string) {
    return this.jobsService.deleteSkill(id);
  }

  @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
  @Patch('skills/:id')
  updateSkill(@Param('id') id: string, @Body('name') name: string) {
    return this.jobsService.updateSkill(id, name);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user?.sub;
    return this.jobsService.findOne(id, userId);
  }

  @Get(':id/analytics')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  getAnalytics(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    return this.jobsService.getJobAnalytics(id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobsService.update(id, updateJobDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }

  @Post(':id/approve')
  @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
  approve(@Param('id') id: string) {
    return this.jobsService.approveJob(id);
  }

  @Post(':id/reject')
  rejectJob(@Param('id') id: string) {
    return this.jobsService.rejectJob(id);
  }

  @Post(':id/close')
  closeJob(@Param('id') id: string) {
    return this.jobsService.closeJob(id);
  }

  @Post(':id/pause')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  pauseJob(@Param('id') id: string, @Request() req) {
    return this.jobsService.pauseJob(id, req.user.sub);
  }

  @Post(':id/resume')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  resumeJob(@Param('id') id: string, @Request() req) {
    return this.jobsService.resumeJob(id, req.user.sub);
  }

  @Post(':id/lock')
  lockJob(@Param('id') id: string) {
    return this.jobsService.lockJob(id);
  }

  @Post(':id/unlock')
  unlockJob(@Param('id') id: string) {
    return this.jobsService.unlockJob(id);
  }

  @Post(':id/duplicate')
  duplicateJob(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    return this.jobsService.duplicateJob(id, userId);
  }

  @Post(':id/extend')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  extendJobDuration(@Param('id') id: string, @Body('days') days: number, @Request() req) {
    const userId = req.user.sub;
    return this.jobsService.extendJobDuration(id, userId, days);
  }

  @Post(':id/promote')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  promoteJob(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    return this.jobsService.promoteJob(id, userId);
  }

  @Get(':id/recommendations')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  async getRecommendedFreelancers(@Param('id') id: string) {
    // This points to search-service for matching
    return { searchServiceUrl: `/api/search/freelancers/recommendations/${id}` };
  }

  @Get('client/stats')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  getClientStats(@Request() req) {
    return this.jobsService.getClientStats(req.user.sub);
  }

  @Get('sync')
  sync(
    @AuthenticatedUser() user: any,
    @Query('since') since: string,
    @Query('entities') entities: string,
  ) {
    const entityList = entities
      ? entities.split(',')
      : ['Job', 'Category', 'Skill', 'Proposal', 'ServicePackage', 'Milestone'];
    return this.jobsService.sync(
      since || new Date(0).toISOString(),
      entityList,
      user.sub,
    );
  }
}
