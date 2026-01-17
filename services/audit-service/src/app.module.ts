import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuditModule } from './audit/audit.module';
import { PrismaModule } from './prisma/prisma.module';
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
        PrismaModule,
        AuditModule,
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
    providers: [
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
