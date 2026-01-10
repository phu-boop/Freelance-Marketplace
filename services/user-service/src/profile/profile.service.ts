// src/profile/profile.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDraftDto } from './dto/create-profile-draft.dto';
import { Profile } from '@prisma/client';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async upsertDraft(
    userId: string,
    dto: CreateProfileDraftDto,
  ): Promise<Profile> {
    const {
      education,
      experience,
      portfolio,
      firstName,
      lastName,
      phone,
      country,
      avatarUrl,
      ...profileData
    } = dto;

    // 0. Update User model (basic info)
    if (firstName || lastName || phone || country || avatarUrl) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { firstName, lastName, phone, country, avatarUrl },
      });
    }

    // 1. Update Profile model (basic info)
    const profile = await this.prisma.profile.upsert({
      where: { userId },
      update: { ...profileData, isComplete: false },
      create: { userId, ...profileData, isComplete: false },
    });

    // 2. Handle Education (overwrite for draft simplicity)
    if (education) {
      await this.prisma.education.deleteMany({ where: { userId } });
      await this.prisma.education.createMany({
        data: education.map((edu) => ({
          ...edu,
          startDate: new Date(edu.startDate),
          endDate: edu.endDate ? new Date(edu.endDate) : null,
          userId,
        })),
      });
    }

    // 3. Handle Experience
    if (experience) {
      await this.prisma.experience.deleteMany({ where: { userId } });
      await this.prisma.experience.createMany({
        data: experience.map((exp) => ({
          ...exp,
          startDate: new Date(exp.startDate),
          endDate: exp.endDate ? new Date(exp.endDate) : null,
          userId,
        })),
      });
    }

    // 4. Handle Portfolio
    if (portfolio) {
      await this.prisma.portfolioItem.deleteMany({ where: { userId } });
      await this.prisma.portfolioItem.createMany({
        data: portfolio.map((item) => ({ ...item, userId })),
      });
    }

    return profile;
  }

  async getDraft(userId: string): Promise<any> {
    return this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            education: true,
            experience: true,
            portfolio: true,
          },
        },
      },
    });
  }

  async completeProfile(userId: string): Promise<Profile> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!profile) throw new Error('Profile draft not found');

    // Update User model and completion percentage
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        title: profile.headline,
        overview: profile.bio,
        hourlyRate: profile.hourlyRate,
        skills: profile.skills,
        primaryCategoryId: profile.primaryCategoryId,
      },
      include: {
        education: true,
        experience: true,
        portfolio: true,
      },
    });

    const completionPercentage =
      this.usersService.calculateCompletionPercentage(updatedUser);

    await this.prisma.user.update({
      where: { id: userId },
      data: { completionPercentage },
    });

    return this.prisma.profile.update({
      where: { userId },
      data: { isComplete: true },
    });
  }
}
