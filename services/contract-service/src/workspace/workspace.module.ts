import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceGateway } from './workspace.gateway';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceAiService } from './workspace-ai.service';

@Module({
  controllers: [WorkspaceController],
  providers: [WorkspaceService, WorkspaceGateway, WorkspaceAiService],
  exports: [WorkspaceService, WorkspaceAiService],
})
export class WorkspaceModule { }
