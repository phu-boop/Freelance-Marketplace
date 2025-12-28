import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { CreateCategoryDto } from '../categories/create-category.dto';
import { Public, Roles } from 'nest-keycloak-connect';

@Controller('api/jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }

  @Post()
  @Roles({ roles: ['realm:CLIENT', 'realm:ADMIN'] })
  create(@Body() createJobDto: CreateJobDto) {
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
  findByClient(@Query('clientId') clientId: string) {
    return this.jobsService.findByClient(clientId);
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
  @Public()
  @Post('categories')
  createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.jobsService.createCategory(createCategoryDto);
  }

  @Public()
  @Get('categories')
  findAllCategories() {
    return this.jobsService.findAllCategories();
  }

  // Skills
  @Public()
  @Post('skills')
  createSkill(@Body('name') name: string) {
    return this.jobsService.createSkill(name);
  }

  @Public()
  @Get('skills')
  findAllSkills() {
    return this.jobsService.findAllSkills();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
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
  @Roles({ roles: ['realm:ADMIN'] })
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

  @Post(':id/lock')
  lockJob(@Param('id') id: string) {
    return this.jobsService.lockJob(id);
  }

  @Post(':id/unlock')
  unlockJob(@Param('id') id: string) {
    return this.jobsService.unlockJob(id);
  }

  @Post(':id/duplicate')
  duplicateJob(@Param('id') id: string) {
    return this.jobsService.duplicateJob(id);
  }
}
