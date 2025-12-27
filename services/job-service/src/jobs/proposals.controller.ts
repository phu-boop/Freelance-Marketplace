import { Controller, Post, Body, Request, UseGuards, Get, Param } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { Public, Roles, AuthenticatedUser } from 'nest-keycloak-connect';

@Controller('api/proposals')
export class ProposalsController {
    constructor(private readonly jobsService: JobsService) { }

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
}
