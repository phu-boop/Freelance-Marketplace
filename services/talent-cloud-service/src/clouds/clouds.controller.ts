import { Controller, Post, Body, Param, Delete, Get, Patch, Request, UnauthorizedException } from '@nestjs/common';
import { CloudsService } from './clouds.service';
import { Public, Roles, AuthenticatedUser } from 'nest-keycloak-connect';

@Controller('api/clouds')
export class CloudsController {
    constructor(private readonly cloudsService: CloudsService) { }

    @Get()
    @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'] })
    async getMyClouds(@AuthenticatedUser() user: any) {
        if (!user?.sub) throw new UnauthorizedException();
        return this.cloudsService.getCloudsForUser(user.sub);
    }

    @Post()
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async create(@Body() dto: { name: string; description?: string; ownerId: string; visibility?: 'PRIVATE' | 'PUBLIC' }) {
        return this.cloudsService.createCloud(dto);
    }

    @Post(':cloudId/invite')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN', 'realm:CLIENT', 'CLIENT'] })
    async invite(@Request() req, @Param('cloudId') cloudId: string, @Body() dto: { userId: string }) {
        const inviterId = req.user?.sub;
        if (!inviterId) throw new UnauthorizedException();
        return this.cloudsService.inviteMember(cloudId, dto.userId, inviterId);
    }

    @Get('invitations/my')
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
    async getMyInvitations(@AuthenticatedUser() user: any) {
        if (!user?.sub) throw new UnauthorizedException();
        return this.cloudsService.getInvitations(user.sub);
    }

    @Post('invitations/:invitationId/respond')
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
    async respond(@AuthenticatedUser() user: any, @Param('invitationId') invitationId: string, @Body() dto: { accept: boolean }) {
        if (!user?.sub) throw new UnauthorizedException();
        return this.cloudsService.respondToInvitation(invitationId, user.sub, dto.accept);
    }

    @Post(':cloudId/members')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async addMember(@Param('cloudId') cloudId: string, @Body() dto: { userId: string; role?: 'ADMIN' | 'MEMBER' }) {
        return this.cloudsService.addMember(cloudId, dto.userId, dto.role);
    }

    @Post(':cloudId/members/bulk')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async addMembersBulk(@Param('cloudId') cloudId: string, @Body() dto: { userIds: string[]; role?: 'ADMIN' | 'MEMBER' }) {
        return this.cloudsService.addMembersBulk(cloudId, dto.userIds, dto.role);
    }

    @Delete(':cloudId/members/:userId')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async removeMember(@Param('cloudId') cloudId: string, @Param('userId') userId: string) {
        return this.cloudsService.removeMember(cloudId, userId);
    }

    @Get('user/:userId')
    @Public()
    async listForUser(@Param('userId') userId: string) {
        return this.cloudsService.listCloudsForUser(userId);
    }

    @Get(':id')
    @Public()
    async getOne(@Param('id') id: string) {
        return this.cloudsService.getCloud(id);
    }

    @Patch(':id')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    async update(@Param('id') id: string, @Body() dto: { name?: string; description?: string; visibility?: 'PRIVATE' | 'PUBLIC'; costCenter?: string; budget?: number }) {
        return this.cloudsService.updateCloud(id, dto);
    }
}
