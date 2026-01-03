import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { PublicController } from './public.controller';

@Module({
  imports: [HttpModule],
  controllers: [AdminsController, PublicController],
  providers: [AdminsService],
})
export class AdminsModule { }
