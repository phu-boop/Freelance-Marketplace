import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AdminsModule } from './admins/admins.module';
import { HealthController } from './health/health.controller';
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
    KeycloakConnectModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        authServerUrl: configService.get<string>('KEYCLOAK_URL', 'http://localhost:8080'),
        realm: configService.get<string>('KEYCLOAK_REALM', 'freelance-marketplace'),
        clientId: configService.get<string>('KEYCLOAK_CLIENT_ID', 'freelance-client'),
        secret: configService.get<string>('KEYCLOAK_SECRET', 'xwI5XqQWUNSJLtQ6g9IbSbJsjgK0U6M3'),
        tokenValidation: TokenValidation.OFFLINE,
        policy: 'PERMISSIVE',
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    TerminusModule,
    HttpModule,
    PrismaModule,
    AdminsModule,
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
