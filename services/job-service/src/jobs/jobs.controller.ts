import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }

  @Post()
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto);
  }

  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  @Get('my-jobs')
  findByClient(@Query('clientId') clientId: string) {
    return this.jobsService.findByClient(clientId);
  }

  // Categories
  @Post('categories')
  createCategory(@Body('name') name: string) {
    return this.jobsService.createCategory(name);
  }

  @Get('categories')
  findAllCategories() {
    return this.jobsService.findAllCategories();
  }

  // Skills
  @Post('skills')
  createSkill(@Body('name') name: string) {
    return this.jobsService.createSkill(name);
  }

  @Get('skills')
  findAllSkills() {
    return this.jobsService.findAllSkills();
  }

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
  approveJob(@Param('id') id: string) {
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
