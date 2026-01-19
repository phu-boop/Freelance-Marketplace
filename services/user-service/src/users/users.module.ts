import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthController } from './auth.controller';
import { AiService } from './ai.service';
import { SecurityService } from './security.service';
import { BadgesService } from './badges.service';
import { EncryptionService } from './encryption.service';
import { JurisdictionService } from './jurisdiction.service';

import { PrismaModule } from '../prisma/prisma.module';
import { KeycloakModule } from '../keycloak/keycloak.module';

import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    PrismaModule,
    KeycloakModule,
    ConfigModule,
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'secret'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController, AuthController],
  providers: [UsersService, AiService, SecurityService, BadgesService, JurisdictionService, EncryptionService],
  exports: [UsersService, AiService, SecurityService, BadgesService, JurisdictionService, EncryptionService],
})
export class UsersModule { }
