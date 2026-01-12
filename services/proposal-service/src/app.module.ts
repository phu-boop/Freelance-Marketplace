import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProposalsModule } from './proposals/proposals.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';
import { ConfigModule } from '@nestjs/config';

import {
  KeycloakConnectModule,
  ResourceGuard,
  RoleGuard,
  AuthGuard,
  TokenValidation,
} from 'nest-keycloak-connect';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    TerminusModule,
    ProposalsModule,
    PrismaModule,
    KeycloakConnectModule.registerAsync({
      useFactory: () => ({
        authServerUrl: process.env.KEYCLOAK_URL || 'http://keycloak:8080',
        realm: process.env.KEYCLOAK_REALM || 'freelance-marketplace',
        clientId: process.env.KEYCLOAK_CLIENT_ID || 'freelance-client',
        secret: process.env.KEYCLOAK_SECRET || '',
        tokenValidation: TokenValidation.OFFLINE,
      }),
    }),
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule { }
