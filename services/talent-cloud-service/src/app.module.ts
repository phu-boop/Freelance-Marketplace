import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CloudsModule } from './clouds/clouds.module';
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
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        CloudsModule,
        KeycloakConnectModule.registerAsync({
            useFactory: (configService: ConfigService) => ({
                authServerUrl: configService.get('KEYCLOAK_URL', 'http://keycloak:8080'),
                realm: configService.get('KEYCLOAK_REALM', 'freelance-marketplace'),
                clientId: configService.get('KEYCLOAK_CLIENT_ID', 'freelance-client'),
                secret: configService.get('KEYCLOAK_SECRET', ''),
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
