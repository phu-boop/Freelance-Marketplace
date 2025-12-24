// src/profile/profile.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDraftDto } from './dto/create-profile-draft.dto';
import { Profile } from '@prisma/client';

@Injectable()
export class ProfileService {
    constructor(private readonly prisma: PrismaService) { }

    async upsertDraft(userId: string, dto: CreateProfileDraftDto): Promise<Profile> {
        // Upsert profile draft (isComplete flag false)
        return this.prisma.profile.upsert({
            where: { userId },
            update: { ...dto, isComplete: false },
            create: { userId, ...dto, isComplete: false },
        });
    }

    async getDraft(userId: string): Promise<Profile | null> {
        return this.prisma.profile.findUnique({ where: { userId } });
    }

    async completeProfile(userId: string): Promise<Profile> {
        return this.prisma.profile.update({
            where: { userId },
            data: { isComplete: true },
        });
    }
}
