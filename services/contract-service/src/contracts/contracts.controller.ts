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
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { DisputeContractDto } from './dto/dispute-contract.dto';
import { Roles, Public } from 'nest-keycloak-connect';

import { DisputesService } from './disputes.service';
import { JurisdictionService } from './jurisdiction.service';

@Controller('api/contracts')
export class ContractsController {
  constructor(
    private readonly contractsService: ContractsService,
    private readonly disputesService: DisputesService,
    private readonly jurisdictionService: JurisdictionService
  ) { }

  @Get('jurisdiction/:countryCode')
  @Public()
  getJurisdictionClauses(@Param('countryCode') countryCode: string) {
    return this.jurisdictionService.getClausesForCountry(countryCode.toUpperCase());
  }

  @Get('between/:otherUserId')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'] })
  async getContractBetween(
    @Param('otherUserId') otherUserId: string,
    @Request() req,
  ) {
    const userId = req.user.sub;
    return this.contractsService.findActiveBetween(userId, otherUserId);
  }

  @Get('my')
  @Roles({
    roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'],
  })
  getMyContracts(@Request() req, @Query('agencyId') agencyId?: string) {
    const userId = req.user.sub;
    const roles = req.user.realm_access?.roles || [];
    if (roles.includes('CLIENT')) {
      return this.contractsService.findByClient(userId, agencyId);
    }
    return this.contractsService.findByFreelancer(userId, agencyId);
  }

  @Post()
  @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:ADMIN', 'ADMIN'] })
  create(@Body() createContractDto: CreateContractDto, @Request() req) {
    const authHeader = req.headers.authorization;
    return this.contractsService.create(createContractDto, authHeader);
  }

  @Get()
  findAll(
    @Query('freelancerId') freelancerId?: string,
    @Query('clientId') clientId?: string,
    @Query('agencyId') agencyId?: string,
  ) {
    return this.contractsService.findAll(freelancerId, clientId, agencyId);
  }

  @Get('disputed')
  findAllDisputed() {
    return this.contractsService.findAllDisputed();
  }

  @Get('internal/freelancer/:userId')
  @Public() // Accessible internally without user token
  findByFreelancerInternal(@Param('userId') userId: string) {
    return this.contractsService.findByFreelancer(userId);
  }

  @Get('client/stats')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  getClientStats(@Request() req) {
    return this.contractsService.getClientStats(req.user.sub);
  }

  @Post('milestones/auto-release')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'] })
  triggerAutoRelease() {
    return this.contractsService.autoReleaseMilestones();
  }

  @Post('disputes/check-timeouts')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'] })
  triggerDisputeTimeouts() {
    return this.contractsService.handleDisputeTimeouts();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContractDto: UpdateContractDto,
  ) {
    return this.contractsService.update(id, updateContractDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contractsService.remove(id);
  }

  @Get(':id/risk-analysis')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'] })
  getRiskAnalysis(@Param('id') id: string) {
    return this.contractsService.getRiskAnalysis(id);
  }

  @Get(':id/timeline')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER', 'realm:ADMIN', 'ADMIN'] })
  getTimeline(@Param('id') id: string) {
    return this.contractsService.getDisputeTimeline(id);
  }

  @Post(':id/milestones')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  addMilestone(@Param('id') id: string, @Body() milestoneData: any) {
    return this.contractsService.addMilestone(id, milestoneData);
  }

  @Post(':id/check-ins')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'] })
  createCheckIn(@Param('id') id: string, @Body() data: any) {
    return this.contractsService.createCheckIn(id, data);
  }

  @Post(':id/check-ins/suggest')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'] })
  suggestMeetingTimes(@Param('id') id: string) {
    return this.contractsService.suggestMeetingTimes(id);
  }

  @Post('time-sessions/:id/activity')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
  recordActivity(
    @Param('id') id: string,
    @Body() data: { activityScore: number; idleMinutes: number },
  ) {
    return this.contractsService.recordSessionActivity(id, data);
  }

  @Post(':id/milestones/:milestoneId/activate')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  activateMilestone(
    @Param('id') id: string,
    @Param('milestoneId') milestoneId: string,
    @Request() req,
  ) {
    const authHeader = req.headers.authorization;
    return this.contractsService.activateMilestone(id, { milestoneId }, authHeader);
  }

  @Post(':id/submit')
  submitWork(
    @Param('id') id: string,
    @Body()
    submissionData: {
      milestoneId: string;
      content: string;
      attachments: string[];
      type: 'PROGRESS_REPORT' | 'FINAL_RESULT';
    },
  ) {
    return this.contractsService.submitWork(id, submissionData);
  }

  @Post(':id/approve')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  approveWork(
    @Param('id') id: string,
    @Body() approvalData: { milestoneId: string },
    @Request() req,
  ) {
    const authHeader = req.headers.authorization;
    return this.contractsService.approveWork(id, approvalData, authHeader);
  }

  @Post(':id/reject-work')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  rejectWork(
    @Param('id') id: string,
    @Body() rejectionData: { milestoneId: string; reason: string },
  ) {
    return this.contractsService.rejectWork(id, rejectionData);
  }

  @Post(':id/dispute')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'] })
  disputeContract(
    @Param('id') id: string,
    @Body() disputeData: DisputeContractDto,
    @Request() req,
  ) {
    return this.contractsService.disputeContract(
      id,
      disputeData.reason,
      req.user.sub,
      disputeData.evidence,
    );
  }

  @Post(':id/resolve-dispute')
  @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
  resolveDispute(
    @Param('id') id: string,
    @Body() resolutionData: { resolution: 'COMPLETED' | 'TERMINATED' },
    @Request() req,
  ) {
    const token = req.headers.authorization;
    // Legacy simple resolution or redirect to new flow?
    // Maintaining for backward compatibility but using new service for logic if possible
    return this.contractsService.resolveDispute(
      id,
      resolutionData.resolution,
      token,
    );
  }

  @Post('disputes/:id/escalate')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'] })
  escalateDispute(@Param('id') id: string, @Request() req) {
    return this.disputesService.escalateToArbitration(id, req.user.sub);
  }

  @Post('disputes/:id/evidence')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'] })
  addEvidence(
    @Param('id') id: string,
    @Body() data: { fileUrl: string; description: string; fileType?: string },
    @Request() req
  ) {
    return this.disputesService.addEvidence(id, req.user.sub, data);
  }

  @Get('disputes/:id/ai-analysis')
  @Roles({ roles: ['realm:ADMIN', 'ADMIN', 'realm:INVESTIGATOR', 'INVESTIGATOR', 'realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'] })
  getAiDisputeAnalysis(@Param('id') id: string) {
    return this.disputesService.getAiAnalysis(id);
  }

  @Post(':id/log-time')
  logTime(
    @Param('id') id: string,
    @Body() logData: { hours: number; description: string; date: string },
  ) {
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
  rejectTimeLog(
    @Param('logId') logId: string,
    @Body() body: { reason: string },
    @Request() req,
  ) {
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
  @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'] })
  extendContract(
    @Param('id') id: string,
    @Body() data: { additionalAmount?: number; newEndDate?: string },
    @Request() req,
  ) {
    const userId = req.user.sub;
    return this.contractsService.extendContract(id, userId, data);
  }

  // Insurance Marketplace
  @Get('insurance/options')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
  listInsuranceOptions() {
    return this.contractsService.listInsuranceOptions();
  }

  @Post(':id/insurance')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
  purchaseInsurance(
    @Param('id') id: string,
    @Body()
    body: { provider: string; coverageAmount: number; premiumAmount: number },
  ) {
    return this.contractsService.purchaseInsurance(id, body);
  }

  @Post(':id/check-ins')
  @Roles({
    roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'],
  })
  scheduleCheckIn(
    @Param('id') id: string,
    @Body()
    data: {
      title: string;
      description?: string;
      scheduledAt: string;
      durationMinutes?: number;
    },
    @Request() req,
  ) {
    const userId = req.user.sub;
    return this.contractsService.scheduleCheckIn(id, data, userId);
  }

  @Get(':id/check-ins')
  @Roles({
    roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'],
  })
  getCheckIns(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    return this.contractsService.getCheckIns(id, userId);
  }

  @Get(':id/time-logs')
  @Roles({
    roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'],
  })
  getTimeLogs(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    return this.contractsService.getTimeLogs(id, userId);
  }

  @Post('check-ins/:checkInId/start')
  @Roles({
    roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'],
  })
  startCheckInMeeting(@Param('checkInId') checkInId: string, @Request() req) {
    const userId = req.user.sub;
    return this.contractsService.startCheckInMeeting(checkInId, userId);
  }

  // Contract Templates
  @Post('templates')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT'] })
  createTemplate(
    @Body() data: { name: string; description?: string; content: string },
    @Request() req,
  ) {
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

  @Post(':id/arbitration')
  @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
  openArbitration(
    @Param('id') id: string,
    @Body() data: { investigatorId?: string },
  ) {
    return this.contractsService.openArbitration(id, data.investigatorId);
  }

  @Patch('arbitration/:caseId/assign')
  @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
  assignInvestigator(
    @Param('caseId') caseId: string,
    @Body() data: { investigatorId: string },
  ) {
    return this.disputesService.assignInvestigator(
      caseId,
      data.investigatorId,
    );
  }

  @Patch('arbitration/:caseId/decision')
  @Roles({
    roles: ['realm:INVESTIGATOR', 'INVESTIGATOR', 'realm:ADMIN', 'ADMIN'],
  })
  submitDecision(
    @Param('caseId') caseId: string,
    @Body() data: { decision: string },
    @Request() req
  ) {
    // Pass user ID as investigator ID for verification
    return this.disputesService.resolveCase(caseId, data.decision, req.user?.sub);
  }

  @Post('arbitration/:caseId/resolve-split')
  @Roles({
    roles: ['realm:INVESTIGATOR', 'INVESTIGATOR', 'realm:ADMIN', 'ADMIN'],
  })
  resolveWithSplit(
    @Param('caseId') caseId: string,
    @Body() data: { milestoneId: string; freelancerPercentage: number; decision: string },
    @Request() req
  ) {
    return this.disputesService.resolveCaseWithSplit(
      caseId,
      data.milestoneId,
      data.freelancerPercentage,
      data.decision,
      req.user?.sub
    );
  }

  @Get('arbitration/list')
  @Roles({
    roles: ['realm:ADMIN', 'ADMIN', 'realm:INVESTIGATOR', 'INVESTIGATOR'],
  })
  listArbitrations(@Request() req) {
    // Reuse existing service for listing as it might be complex query, or implement in disputesService
    // For now, let's keep using contractsService for read-only lists if it exists
    // But actually, implementation plan said new service. Let's redirect to new logic if we added it, 
    // otherwise fallback or add to DisputesService.
    // ContractsService had listArbitrations.
    const roles = req.user.realm_access?.roles || [];
    const userId = req.user.sub;

    if (roles.includes('INVESTIGATOR') && !roles.includes('ADMIN')) {
      return this.contractsService.listArbitrations(userId);
    }
    return this.contractsService.listArbitrations();
  }

  @Get('arbitration/:caseId')
  @Roles({
    roles: ['realm:ADMIN', 'ADMIN', 'realm:INVESTIGATOR', 'INVESTIGATOR'],
  })
  getArbitration(@Param('caseId') caseId: string) {
    return this.disputesService.getCaseDetails(caseId);
  }

  @Get('approvals/pending')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:ADMIN', 'ADMIN'] })
  listPendingApprovals(@Request() req, @Query('teamId') teamId?: string) {
    const userId = req.user.sub;
    return this.contractsService.listPendingApprovals(userId, teamId);
  }

  @Post(':id/approve-hire')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:ADMIN', 'ADMIN'] })
  approveHire(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    const roles = req.user.realm_access?.roles || [];
    return this.contractsService.approveContract(id, userId, roles);
  }

  @Post(':id/reject-hire')
  @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:ADMIN', 'ADMIN'] })
  rejectHire(
    @Param('id') id: string,
    @Body() data: { reason: string },
    @Request() req,
  ) {
    const userId = req.user.sub;
    return this.contractsService.rejectContract(id, userId, data.reason);
  }
}
