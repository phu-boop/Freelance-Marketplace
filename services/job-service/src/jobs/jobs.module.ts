import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { AlertsController } from './alerts.controller';
import { ProposalsController } from './proposals.controller';
import { TimesheetsController } from './timesheets.controller';
import { ServicePackagesController } from './service-packages.controller';
import { InterviewsController } from './interviews.controller';
import { InvitationsController } from './invitations.controller';
import { TimesheetsService } from './timesheets.service';
import { HttpModule } from '@nestjs/axios';
import { AiService } from './ai.service';
import { ConfigModule } from '@nestjs/config';
import { EscrowSchedulerService } from './escrow-scheduler.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [JobsController, AlertsController, ProposalsController, TimesheetsController, ServicePackagesController, InterviewsController, InvitationsController],
  providers: [JobsService, TimesheetsService, AiService, EscrowSchedulerService],
})
export class JobsModule { }
