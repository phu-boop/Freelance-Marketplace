// src/profile/profile.module.ts
import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { SpecializedProfilesService } from './specialized-profiles.service';
import { SpecializedProfilesController } from './specialized-profiles.controller';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'secret'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ProfileController, SpecializedProfilesController],
  providers: [ProfileService, SpecializedProfilesService],
  exports: [ProfileService, SpecializedProfilesService],
})
export class ProfileModule { }
