import { Controller, Post, Body, Param, Delete, Get, Patch } from '@nestjs/common';
import { CloudsService } from './clouds.service';

@Controller('api/clouds')
export class CloudsController {
    constructor(private readonly cloudsService: CloudsService) { }

    @Post()
    async create(@Body() dto: { name: string; description?: string; ownerId: string; visibility?: 'PRIVATE' | 'PUBLIC' }) {
        return this.cloudsService.createCloud(dto);
    }

    @Post(':cloudId/members')
    async addMember(@Param('cloudId') cloudId: string, @Body() dto: { userId: string; role?: 'ADMIN' | 'MEMBER' }) {
        return this.cloudsService.addMember(cloudId, dto.userId, dto.role);
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
