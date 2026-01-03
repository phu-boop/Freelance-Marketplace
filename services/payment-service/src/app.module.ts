import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health/health.controller';

import { ConfigModule, ConfigService } from '@nestjs/config';
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
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    TerminusModule,
    ScheduleModule.forRoot(),
    PaymentsModule,
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
