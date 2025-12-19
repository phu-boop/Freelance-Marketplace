import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';

@Module({
  imports: [HttpModule],
  controllers: [ContractsController],
  providers: [ContractsService],
})
export class ContractsModule { }
