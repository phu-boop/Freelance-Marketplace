import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';

@Module({
    imports: [PrismaModule],
    providers: [TeamService],
    controllers: [TeamController],
    exports: [TeamService],
})
export class TeamModule { }
