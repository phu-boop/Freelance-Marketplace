import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { Roles } from 'nest-keycloak-connect';

@Controller('api/ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('proposals/enhance')
    @Roles({ roles: ['realm:FREELANCER'] })
    async enhanceProposal(@Body() data: { jobDescription: string; freelancerBio: string; tone?: string }) {
        const enhancedContent = await this.aiService.generateProposalContent(
            data.jobDescription,
            data.freelancerBio,
            data.tone
        );
        return { content: enhancedContent };
    }

    @Post('jobs/scoping')
    @Roles({ roles: ['realm:CLIENT'] })
    async scopeJob(@Body() data: { jobDescription: string }) {
        const milestones = await this.aiService.analyzeJobScoping(data.jobDescription);
        return { milestones };
    }
}
