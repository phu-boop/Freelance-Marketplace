import { Controller, Get, Post, Param, Body, Request } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { Roles } from 'nest-keycloak-connect';

@Controller('api/contracts/:contractId/workspace')
export class WorkspaceController {
    constructor(private readonly workspaceService: WorkspaceService) { }

    @Get()
    @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'] })
    getWorkspace(@Param('contractId') contractId: string) {
        return this.workspaceService.getWorkspace(contractId);
    }

    @Post()
    @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'] })
    createWorkspace(@Param('contractId') contractId: string) {
        return this.workspaceService.createWorkspace(contractId);
    }
}
