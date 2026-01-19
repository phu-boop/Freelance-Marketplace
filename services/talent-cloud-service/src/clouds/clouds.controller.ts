import { Controller, Post, Body, Param, Delete, Get, Patch, Request } from '@nestjs/common';
import { CloudsService } from './clouds.service';

@Controller('api/clouds')
export class CloudsController {
    constructor(private readonly cloudsService: CloudsService) { }

    @Post()
    async create(@Body() dto: { name: string; description?: string; ownerId: string; visibility?: 'PRIVATE' | 'PUBLIC' }) {
        return this.cloudsService.createCloud(dto);
    }

    @Post(':cloudId/invite')
    async invite(@Request() req, @Param('cloudId') cloudId: string, @Body() dto: { userId: string }) {
        // In a real app, req.user.sub would be the inviterId
        const inviterId = req.user?.sub || 'admin';
        return this.cloudsService.inviteMember(cloudId, dto.userId, inviterId);
    }

    @Get('invitations/my')
    async getMyInvitations(@Request() req) {
        const userId = req.user?.sub;
        if (!userId) throw new Error('Unauthorized');
        return this.cloudsService.getInvitations(userId);
    }

    @Post('invitations/:invitationId/respond')
    async respond(@Request() req, @Param('invitationId') invitationId: string, @Body() dto: { accept: boolean }) {
        const userId = req.user?.sub;
        if (!userId) throw new Error('Unauthorized');
        return this.cloudsService.respondToInvitation(invitationId, userId, dto.accept);
    }

    @Post(':cloudId/members')
    async addMember(@Param('cloudId') cloudId: string, @Body() dto: { userId: string; role?: 'ADMIN' | 'MEMBER' }) {
        return this.cloudsService.addMember(cloudId, dto.userId, dto.role);
    }

    @Post(':cloudId/members/bulk')
    async addMembersBulk(@Param('cloudId') cloudId: string, @Body() dto: { userIds: string[]; role?: 'ADMIN' | 'MEMBER' }) {
        return this.cloudsService.addMembersBulk(cloudId, dto.userIds, dto.role);
    }

    @Delete(':cloudId/members/:userId')
    async removeMember(@Param('cloudId') cloudId: string, @Param('userId') userId: string) {
        return this.cloudsService.removeMember(cloudId, userId);
    }

    @Get('user/:userId')
    async listForUser(@Param('userId') userId: string) {
        return this.cloudsService.listCloudsForUser(userId);
    }

    @Get(':id')
    async getOne(@Param('id') id: string) {
        return this.cloudsService.getCloud(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: { name?: string; description?: string; visibility?: 'PRIVATE' | 'PUBLIC'; costCenter?: string; budget?: number }) {
        return this.cloudsService.updateCloud(id, dto);
    }
}
