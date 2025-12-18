import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) { }

  @Post()
  create(@Body() createContractDto: CreateContractDto) {
    return this.contractsService.create(createContractDto);
  }

  @Get()
  findAll() {
    return this.contractsService.findAll();
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
  submitWork(@Param('id') id: string, @Body() submissionData: { milestoneId: string; attachments: string[] }) {
    return this.contractsService.submitWork(id, submissionData);
  }

  @Post(':id/approve')
  approveWork(@Param('id') id: string, @Body() approvalData: { milestoneId: string }) {
    return this.contractsService.approveWork(id, approvalData);
  }

  @Post(':id/dispute')
  disputeContract(@Param('id') id: string, @Body() disputeData: { reason: string }) {
    return this.contractsService.disputeContract(id, disputeData.reason);
  }
}
