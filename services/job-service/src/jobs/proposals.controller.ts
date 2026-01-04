import { Controller, Post, Body, Param, Get, Request, Patch, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { AiService } from './ai.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { Public, Roles, AuthenticatedUser } from 'nest-keycloak-connect';

@Controller('api/proposals')
export class ProposalsController {
    constructor(
        private readonly jobsService: JobsService,
        private readonly aiService: AiService,
    ) { }

    @Get()
    @Roles({ roles: ['realm:CLIENT'] })
    async findAllByJob(@Request() req, @Query('jobId') jobId: string) {
        return this.jobsService.getProposalsByJobId(jobId, req.user.sub);
    }

    @Get('generate-ai')
    @Roles({ roles: ['realm:FREELANCER'] })
    async generateAiProposal(@Request() req, @Query('jobId') jobId: string) {
        const userId = req.user.sub;
        return this.aiService.generateProposal(jobId, userId);
    }

    @Post()
    @Roles({ roles: ['realm:FREELANCER'] })
    async create(@Request() req, @Body() dto: CreateProposalDto) {
        // If authenticated, get user ID from token, else we might need a fallback for testing
        const userId = req.user.sub;
        return this.jobsService.createProposal(userId, dto);
    }

    @Get('my')
    @Roles({ roles: ['realm:FREELANCER'] })
    async getMy(@Request() req) {
        const userId = req.user.sub;
        return this.jobsService.getMyProposals(userId);
    }

    @Get(':id')
    @Roles({ roles: ['realm:FREELANCER', 'realm:CLIENT'] })
    async getById(@Request() req, @Param('id') id: string) {
        return this.jobsService.getProposalById(id, req.user.sub);
    }

    @Post(':id/withdraw')
    @Roles({ roles: ['realm:FREELANCER'] })
    async withdraw(@Request() req, @Param('id') id: string) {
        const userId = req.user.sub;
        return this.jobsService.withdrawProposal(userId, id);
    }

    @Post('/:id/duplicate')
    duplicate(@AuthenticatedUser() user: any, @Param('id') id: string, @Body('toJobId') toJobId?: string) {
        return this.jobsService.duplicateProposal(user.sub, id, toJobId);
    }

    @Post('/:id/offer')
    sendOffer(@AuthenticatedUser() user: any, @Param('id') id: string) {
        return this.jobsService.sendOffer(user.sub, id);
    }

    @Post(':id/offer/accept')
    @Roles({ roles: ['realm:FREELANCER'] })
    async acceptOffer(@Request() req, @Param('id') id: string) {
        const userId = req.user.sub;
        return this.jobsService.acceptOffer(userId, id);
    }

    @Post(':id/offer/decline')
    @Roles({ roles: ['realm:FREELANCER'] })
    async declineOffer(@Request() req, @Param('id') id: string) {
        const userId = req.user.sub;
        return this.jobsService.declineOffer(userId, id);
    }

    @Post(':id/offer/counter')
    @Roles({ roles: ['realm:FREELANCER'] })
    async counterOffer(@Request() req, @Param('id') id: string, @Body() body: { amount: number, timeline: string }) {
        const userId = req.user.sub;
        return this.jobsService.counterOffer(userId, id, body);
    }

    @Post(':id/negotiate')
    @Roles({ roles: ['realm:FREELANCER', 'realm:CLIENT'] })
    async negotiate(@Request() req, @Param('id') id: string, @Body() body: { amount?: number, timeline?: string }) {
        const userId = req.user.sub;
        return this.jobsService.negotiateProposal(userId, id, body);
    }

    @Get('my/contracts')
    @Roles({ roles: ['realm:FREELANCER'] })
    async getContracts(@Request() req) {
        const userId = req.user.sub;
        return this.jobsService.getContracts(userId);
    }

    @Get('contracts/:id')
    @Roles({ roles: ['realm:FREELANCER', 'realm:CLIENT'] })
    async getContractDetails(@Request() req, @Param('id') id: string) {
        return this.jobsService.getContractDetails(id, req.user.sub);
    }

    @Post('contracts/:id/milestones')
    @Roles({ roles: ['realm:FREELANCER', 'realm:CLIENT'] })
    async addMilestone(@Request() req, @Param('id') id: string, @Body() body: any) {
        return this.jobsService.addMilestone(id, req.user.sub, body);
    }

    @Patch(':id/attachments')
    @Roles({ roles: ['realm:FREELANCER', 'realm:CLIENT'] })
    async addAttachment(@Request() req, @Param('id') id: string, @Body('fileName') fileName: string) {
        return this.jobsService.addAttachment(id, req.user.sub, fileName);
    }

    @Post('milestones/:mid/submit')
    @Roles({ roles: ['realm:FREELANCER'] })
    async submitMilestone(@Request() req, @Param('mid') mid: string, @Body() body: any) {
        return this.jobsService.submitMilestone(mid, req.user.sub, body);
    }

    @Post('milestones/:mid/approve')
    @Roles({ roles: ['realm:CLIENT'] })
    async approveMilestone(@Request() req, @Param('mid') mid: string) {
        return this.jobsService.approveMilestone(mid, req.user.sub);
    }

    @Post('milestones/:mid/request-changes')
    @Roles({ roles: ['realm:CLIENT'] })
    async requestChanges(@Request() req, @Param('mid') mid: string, @Body('feedback') feedback: string) {
        return this.jobsService.requestChanges(mid, req.user.sub, feedback);
    }

    @Patch('contracts/:id/progress')
    @Roles({ roles: ['realm:FREELANCER'] })
    async updateProgress(@Request() req, @Param('id') id: string, @Body('progress') progress: number) {
        return this.jobsService.updateProgress(id, req.user.sub, progress);
    }

    @Post('contracts/:id/extension-request')
    @Roles({ roles: ['realm:FREELANCER'] })
    async requestExtension(@Request() req, @Param('id') id: string, @Body() body: { date: string, reason: string }) {
        return this.jobsService.requestExtension(id, req.user.sub, new Date(body.date), body.reason);
    }

    @Post('contracts/:id/terminate')
    @Roles({ roles: ['realm:FREELANCER', 'realm:CLIENT'] })
    async terminateContract(@Request() req, @Param('id') id: string, @Body('reason') reason: string) {
        return this.jobsService.terminateContract(id, req.user.sub, reason);
    }

    @Get('sync')
    @Public()
    sync(
        @Query('since') since: string,
        @Query('entities') entities: string,
    ) {
        const entityList = entities ? entities.split(',') : ['Proposal', 'Milestone'];
        return this.jobsService.sync(since || new Date(0).toISOString(), entityList);
    }
}
