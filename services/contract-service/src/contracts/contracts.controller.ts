import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { Roles } from 'nest-keycloak-connect';

@Controller('contracts')
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

  @Get(':id/time-logs')
  getTimeLogs(@Param('id') id: string) {
    return this.contractsService.getTimeLogs(id);
  }

  @Post('time-logs/:logId/approve')
  approveTimeLog(@Param('logId') logId: string) {
    return this.contractsService.approveTimeLog(logId);
  }
}
