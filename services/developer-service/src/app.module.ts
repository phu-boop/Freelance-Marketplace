import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { KeycloakModule } from './keycloak/keycloak.module';
import { AppsModule } from './apps/apps.module';
import { WebhooksModule } from './webhooks/webhooks.module';

import { BullModule } from '@nestjs/bullmq';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        BullModule.forRoot({
            connection: {
                host: process.env.REDIS_HOST || 'redis',
                port: parseInt(process.env.REDIS_PORT || '6379'),
            },
        }),
        PrismaModule,
        KeycloakModule,
        AppsModule,
        WebhooksModule,
    ],
})
export class AppModule { }
