import { Controller, Post, Body, Param, Get, Request, UseGuards, Patch } from '@nestjs/common';
import { VettingService } from './vetting.service';
import { Roles, RoleMatchingMode } from 'nest-keycloak-connect';

@Controller('api/vetting')
export class VettingController {
    constructor(private readonly vettingService: VettingService) { }

    @Post('assessments/start')
    @Roles({ roles: ['FREELANCER'], mode: RoleMatchingMode.ANY })
    async startAssessment(@Request() req, @Body('skillName') skillName: string) {
        return this.vettingService.startSkillAssessment(req.user.sub, skillName);
    }

    @Get('assessments/:id')
    @Roles({ roles: ['FREELANCER'], mode: RoleMatchingMode.ANY })
    async getAssessment(@Param('id') id: string, @Request() req) {
        return this.vettingService.getAssessment(id, req.user.sub);
    }

    @Post('assessments/:id/submit')
    @Roles({ roles: ['FREELANCER'], mode: RoleMatchingMode.ANY })
    async submitAssessment(
        @Param('id') id: string,
        @Request() req,
        @Body('answers') answers: Record<number, number>
    ) {
        return this.vettingService.submitAssessment(id, req.user.sub, answers);
    }

    @Post('certifications')
    @Roles({ roles: ['FREELANCER'], mode: RoleMatchingMode.ANY })
    async addCertification(@Request() req, @Body() data: any) {
        return this.vettingService.addCertification(req.user.sub, data);
    }

    @Patch('certifications/:id/verify')
    @Roles({ roles: ['ADMIN'], mode: RoleMatchingMode.ANY })
    async verifyCertification(@Param('id') id: string) {
        return this.vettingService.verifyCertification(id);
    }

    @Post('users/:userId/expert-vetted')
    @Roles({ roles: ['ADMIN'], mode: RoleMatchingMode.ANY })
    async approveExpertVetting(@Param('userId') userId: string) {
        return this.vettingService.approveExpertVetting(userId);
    }
}
