import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: string) {
    let user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        education: true,
        experience: true,
        portfolio: true,
      },
    });

    if (!user) {
      // Create a basic user record if it doesn't exist
      // This happens when a user first logs in via Keycloak
      user = await this.prisma.user.create({
        data: {
          id,
          email: `${id}@placeholder.com`, // Email should ideally come from Keycloak
          status: 'ACTIVE',
        },
        include: {
          education: true,
          experience: true,
          portfolio: true,
        },
      });
    }

    return user;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  addEducation(userId: string, data: any) {
    return this.prisma.education.create({
      data: { ...data, userId },
    });
  }

  updateEducation(id: string, data: any) {
    return this.prisma.education.update({
      where: { id },
      data,
    });
  }

  deleteEducation(id: string) {
    return this.prisma.education.delete({
      where: { id },
    });
  }

  addExperience(userId: string, data: any) {
    return this.prisma.experience.create({
      data: { ...data, userId },
    });
  }

  updateExperience(id: string, data: any) {
    return this.prisma.experience.update({
      where: { id },
      data,
    });
  }

  deleteExperience(id: string) {
    return this.prisma.experience.delete({
      where: { id },
    });
  }

  addPortfolio(userId: string, data: any) {
    return this.prisma.portfolioItem.create({
      data: { ...data, userId },
    });
  }

  updatePortfolio(id: string, data: any) {
    return this.prisma.portfolioItem.update({
      where: { id },
      data,
    });
  }

  deletePortfolio(id: string) {
    return this.prisma.portfolioItem.delete({
      where: { id },
    });
  }

  async toggleAvailability(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    return this.prisma.user.update({
      where: { id: userId },
      data: { isAvailable: !user.isAvailable },
    });
  }

  submitKyc(userId: string, idDocument: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: 'PENDING',
        idDocument,
      },
    });
  }

  updateClientInfo(userId: string, data: { companyName?: string, companyLogo?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async toggleTwoFactor(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    return this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: !user.twoFactorEnabled },
    });
  }

  verifyPayment(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isPaymentVerified: true },
    });
  }

  async updateStats(userId: string, rating: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const currentRating = Number(user.rating);
    const currentCount = user.reviewCount;

    // Calculate new average
    const newCount = currentCount + 1;
    const newRating = ((currentRating * currentCount) + rating) / newCount;

    // Enhanced JSS Calculation
    // Formula: (Successful Jobs / Total Jobs) * 100
    // A "Successful Job" is one with rating >= 4.0
    // We also factor in the new rating immediately

    // For this MVP, we'll simulate "Total Jobs" as reviewCount since we don't have full job history here
    // In a real microservices architecture, we'd query the Contract Service or maintain a counter

    // Let's assume previous successful jobs count based on current JSS
    // currentJSS = (prevSuccessful / currentCount) * 100
    // prevSuccessful = (currentJSS / 100) * currentCount

    const currentJss = user.jobSuccessScore || 100; // Default to 100 for new users
    const prevSuccessful = (currentJss / 100) * currentCount;
    const isNewJobSuccessful = rating >= 4.0 ? 1 : 0;

    const newSuccessful = prevSuccessful + isNewJobSuccessful;
    const calculatedJss = (newSuccessful / newCount) * 100;

    // Ensure JSS is within 0-100 and rounded
    const newJss = Math.min(100, Math.max(0, Math.round(calculatedJss)));

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        rating: newRating,
        reviewCount: newCount,
        jobSuccessScore: newJss
      }
    });
  }

  suspendUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status: 'SUSPENDED' }
    });
  }

  banUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status: 'BANNED' }
    });
  }

  activateUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status: 'ACTIVE' }
    });
  }

  async completeOnboarding(userId: string, data: any) {
    const currentUser = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) throw new Error('User not found');

    const updatedData = { ...currentUser, ...data };
    const completionPercentage = this.calculateCompletionPercentage(updatedData);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        completionPercentage,
      },
    });
  }

  private calculateCompletionPercentage(user: any): number {
    const commonFields = ['firstName', 'lastName', 'phone', 'country'];
    const freelancerFields = ['title', 'overview', 'hourlyRate', 'skills'];
    const clientFields = ['companyName', 'industry'];

    let fields = [...commonFields];
    if (user.roles?.includes('FREELANCER')) {
      fields = [...fields, ...freelancerFields];
    } else if (user.roles?.includes('CLIENT')) {
      fields = [...fields, ...clientFields];
    }

    let filled = 0;
    fields.forEach(field => {
      const value = user[field];
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) filled++;
        } else {
          filled++;
        }
      }
    });

    return Math.round((filled / fields.length) * 100);
  }
}
