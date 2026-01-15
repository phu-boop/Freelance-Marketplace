import { Controller, Post, Body, Get, Request, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { Roles } from 'nest-keycloak-connect';

@Controller('api/invitations')
export class InvitationsController {
    constructor(private readonly jobsService: JobsService) { }

    @Post()
    @Roles({ roles: ['realm:CLIENT'] })
    async create(@Request() req, @Body() createInvitationDto: CreateInvitationDto) {
        const clientId = req.user.sub;
        return this.jobsService.createInvitation(clientId, createInvitationDto);
    }

    @Get('freelancer')
    @Roles({ roles: ['realm:FREELANCER'] })
    async getForFreelancer(@Request() req) {
        const freelancerId = req.user.sub;
        return this.jobsService.getFreelancerInvitations(freelancerId);
    }
}
