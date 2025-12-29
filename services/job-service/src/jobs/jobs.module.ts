import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { AlertsController } from './alerts.controller';
import { ProposalsController } from './proposals.controller';
import { TimesheetsController } from './timesheets.controller';
import { TimesheetsService } from './timesheets.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [JobsController, AlertsController, ProposalsController, TimesheetsController],
  providers: [JobsService, TimesheetsService],
})
export class JobsModule { }
