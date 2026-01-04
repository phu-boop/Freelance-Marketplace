import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { Roles } from 'nest-keycloak-connect';

@Controller('api/contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) { }

  @Get('my')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'] })
  getMyContracts(@Request() req) {
    const userId = req.user.sub;
    // We can infer role or try both. For simplicity, let's try both or rely on specific role logic if available in token.
    // Ideally we inspect roles. But since ID is unique, we can check both findByClient and findByFreelancer?
    // Or better:
    const roles = req.user.realm_access?.roles || [];
    if (roles.includes('CLIENT')) {
      return this.contractsService.findByClient(userId);
    }
    return this.contractsService.findByFreelancer(userId);
  }

  @Post()
  @Roles({ roles: ['realm:CLIENT', 'realm:ADMIN'] })
  create(@Body() createContractDto: CreateContractDto) {
    return this.contractsService.create(createContractDto);
  }

  @Get()
  findAll() {
    return this.contractsService.findAll();
  }

  @Get('disputed')
  findAllDisputed() {
    return this.contractsService.findAllDisputed();
  }

  @Get('client/stats')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  getClientStats(@Request() req) {
    return this.contractsService.getClientStats(req.user.sub);
  }

  @Post('milestones/auto-release')
  // In production, this should be protected by a special system role or API key
  // For MVP demo, allowing any authenticated user to trigger the cron-like job
  @Roles({ roles: ['realm:CLIENT', 'realm:FREELANCER'] })
  triggerAutoRelease() {
    return this.contractsService.autoReleaseMilestones();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContractDto: UpdateContractDto) {
    return this.contractsService.update(id, updateContractDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contractsService.remove(id);
  }

  @Post(':id/milestones')
  addMilestone(@Param('id') id: string, @Body() milestoneData: any) {
    return this.contractsService.addMilestone(id, milestoneData);
  }

  @Post(':id/submit')
  submitWork(@Param('id') id: string, @Body() submissionData: { milestoneId: string; content: string; attachments: string[]; type: 'PROGRESS_REPORT' | 'FINAL_RESULT' }) {
    return this.contractsService.submitWork(id, submissionData);
  }

  @Post(':id/approve')
  approveWork(@Param('id') id: string, @Body() approvalData: { milestoneId: string }) {
    return this.contractsService.approveWork(id, approvalData);
  }

  @Post(':id/reject-work')
  rejectWork(@Param('id') id: string, @Body() rejectionData: { milestoneId: string }) {
    return this.contractsService.rejectWork(id, rejectionData);
  }

  @Post(':id/dispute')
  disputeContract(@Param('id') id: string, @Body() disputeData: { reason: string }) {
    return this.contractsService.disputeContract(id, disputeData.reason);
  }

  @Post(':id/resolve-dispute')
  resolveDispute(@Param('id') id: string, @Body() resolutionData: { resolution: 'COMPLETED' | 'TERMINATED' }) {
    return this.contractsService.resolveDispute(id, resolutionData.resolution);
  }

  @Post(':id/log-time')
  logTime(@Param('id') id: string, @Body() logData: { hours: number; description: string; date: string }) {
    return this.contractsService.logTime(id, logData);
  }


  @Post('time-logs/:logId/approve')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  approveTimeLog(@Param('logId') logId: string, @Request() req) {
    const userId = req.user.sub;
    return this.contractsService.approveTimeLog(logId, userId);
  }

  @Post('time-logs/:logId/reject')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  rejectTimeLog(@Param('logId') logId: string, @Body() body: { reason: string }, @Request() req) {
    const userId = req.user.sub;
    return this.contractsService.rejectTimeLog(logId, userId, body.reason);
  }

  @Post(':id/timer/start')
  startTimer(@Param('id') id: string, @Body() body: { description?: string }) {
    return this.contractsService.startTimer(id, body.description);
  }

  @Post(':id/timer/stop')
  stopTimer(@Param('id') id: string) {
    return this.contractsService.stopTimer(id);
  }

  @Post(':id/pause')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  pauseContract(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    return this.contractsService.pauseContract(id, userId);
  }

  @Post(':id/resume')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  resumeContract(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    return this.contractsService.resumeContract(id, userId);
  }

  @Post(':id/extend')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  extendContract(@Param('id') id: string, @Body() data: { additionalAmount?: number; newEndDate?: string }, @Request() req) {
    const userId = req.user.sub;
    return this.contractsService.extendContract(id, userId, data);
  }

  @Post(':id/check-ins')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'] })
  scheduleCheckIn(@Param('id') id: string, @Body() data: { title: string; description?: string; scheduledAt: string; durationMinutes?: number }, @Request() req) {
    const userId = req.user.sub;
    return this.contractsService.scheduleCheckIn(id, data, userId);
  }

  @Get(':id/check-ins')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'] })
  getCheckIns(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    return this.contractsService.getCheckIns(id, userId);
  }

  @Get(':id/time-logs')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'] })
  getTimeLogs(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    return this.contractsService.getTimeLogs(id, userId);
  }

  @Post('check-ins/:checkInId/start')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'] })
  startCheckInMeeting(@Param('checkInId') checkInId: string, @Request() req) {
    const userId = req.user.sub;
    return this.contractsService.startCheckInMeeting(checkInId, userId);
  }

  // Contract Templates
  @Post('templates')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  createTemplate(@Body() data: { name: string; description?: string; content: string }, @Request() req) {
    const userId = req.user.sub;
    return this.contractsService.createTemplate(userId, data);
  }

  @Get('templates')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  getTemplates(@Request() req) {
    const userId = req.user.sub;
    return this.contractsService.getTemplates(userId);
  }

  @Get('templates/:id')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  getTemplate(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    return this.contractsService.getTemplate(id, userId);
  }

  @Delete('templates/:id')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  deleteTemplate(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    return this.contractsService.deleteTemplate(id, userId);
  }
}
