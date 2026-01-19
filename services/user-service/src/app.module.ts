import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
import { UsersModule } from './users/users.module';
import { TeamsModule } from './teams/teams.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { HealthController } from './health/health.controller';
import {
  KeycloakConnectModule,
  ResourceGuard,
  RoleGuard,
  AuthGuard,
  TokenValidation,
} from 'nest-keycloak-connect';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    TerminusModule,
    PrismaModule,
    UsersModule,
    ProfileModule,
    TeamsModule,
    PortfolioModule,
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
