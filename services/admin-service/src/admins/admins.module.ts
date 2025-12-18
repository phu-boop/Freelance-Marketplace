import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';

@Module({
  imports: [HttpModule],
  controllers: [AdminsController],
  providers: [AdminsService],
})
export class AdminsModule { }
