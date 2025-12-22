import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

import { PrismaModule } from '../prisma/prisma.module';
import { KeycloakModule } from '../keycloak/keycloak.module';

@Module({
  imports: [PrismaModule, KeycloakModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule { }
