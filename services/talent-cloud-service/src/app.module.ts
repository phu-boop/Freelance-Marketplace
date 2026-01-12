import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudsModule } from './clouds/clouds.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        CloudsModule,
    ],
})
export class AppModule { }
