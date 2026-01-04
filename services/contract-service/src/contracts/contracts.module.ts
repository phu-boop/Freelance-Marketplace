import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { EscrowSchedulerService } from './escrow-scheduler.service';

@Module({
  imports: [HttpModule],
  controllers: [ContractsController],
  providers: [ContractsService, EscrowSchedulerService],
})
export class ContractsModule { }
