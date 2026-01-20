import { Controller, Get, Post, Param, Body, Request } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceAiService } from './workspace-ai.service';
import { Roles } from 'nest-keycloak-connect';

@Controller('api/contracts/:contractId/workspace')
export class WorkspaceController {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly aiService: WorkspaceAiService,
  ) { }

  @Get()
  @Roles({
    roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'],
  })
  getWorkspace(@Param('contractId') contractId: string) {
    return this.workspaceService.getWorkspace(contractId);
  }

  @Post()
  @Roles({
    roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'],
  })
  createWorkspace(@Param('contractId') contractId: string) {
    return this.workspaceService.createWorkspace(contractId);
  }

  @Post('ai/analyze')
  @Roles({
    roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'],
  })
  async analyzeWorkspace(@Param('contractId') contractId: string, @Body() body: { content: string }) {
    return this.aiService.analyzeRequirements(body.content);
  }

  @Post('ai/check-tone')
  @Roles({
    roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'],
  })
  async checkWorkspaceTone(@Param('contractId') contractId: string, @Body() body: { content: string }) {
    return this.aiService.checkTone(body.content);
  }
}
