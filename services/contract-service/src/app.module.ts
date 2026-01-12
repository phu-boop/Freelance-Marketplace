import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContractsModule } from './contracts/contracts.module';
import { PrismaModule } from './prisma/prisma.module';
import { WorkspaceModule } from './workspace/workspace.module';
import { HealthController } from './health/health.controller';
import { ScheduleModule } from '@nestjs/schedule';

import {
  KeycloakConnectModule,
  ResourceGuard,
  RoleGuard,
  AuthGuard,
  TokenValidation,
} from 'nest-keycloak-connect';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ScheduleModule.forRoot(),
    TerminusModule,
    ContractsModule,
    WorkspaceModule,
    PrismaModule,
    KeycloakConnectModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        authServerUrl: configService.get<string>(
          'KEYCLOAK_URL',
          'http://keycloak:8080',
        ),
        realm: configService.get<string>(
          'KEYCLOAK_REALM',
          'freelance-marketplace',
        ),
        clientId: configService.get<string>(
          'KEYCLOAK_CLIENT_ID',
          'freelance-client',
        ),
        secret: configService.get<string>('KEYCLOAK_SECRET', ''),
        tokenValidation: TokenValidation.OFFLINE,
      }),
      inject: [ConfigService],
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
export class AppModule {}
