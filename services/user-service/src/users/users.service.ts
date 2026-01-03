import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, ConflictException, HttpException, ForbiddenException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

import { PrismaService } from '../prisma/prisma.service';
import { KeycloakService } from '../keycloak/keycloak.service';

import * as qrcode from 'qrcode';
import { authenticator } from 'otplib';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt'; // Restored
import * as crypto from 'crypto'; // Restored
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private keycloakService: KeycloakService, // Fixed typo
    private jwtService: JwtService,
    private httpService: HttpService
  ) { }

  private async sendWelcomeEmail(email: string, name: string) {
    const url = 'http://freelance_email_service:3012/email/send';
    try {
      await firstValueFrom(
        this.httpService.post(url, {
          to: email,
          subject: 'Welcome to Freelance Marketplace',
          text: `Hi ${name || 'User'},\n\nWelcome to Freelance Marketplace! We are excited to have you on board.\n\nBest regards,\nThe Team`
        })
      );
    } catch (error) {
      console.error('Failed to send welcome email:', error.message);
    }
  }

  private generateReferralCode(firstName: string = 'USER'): string {
    const prefix = firstName.slice(0, 3).toUpperCase();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `${prefix}-${random}`;
  }

  async register(createUserDto: CreateUserDto & { referralCode?: string }) {
    const { referralCode: providedCode, ...dto } = createUserDto;
    try {
      // 1. Create user in Keycloak
      const keycloakId = await this.keycloakService.createUser({
        email: createUserDto.email,
        password: createUserDto.password,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.roles?.[0] || 'FREELANCER'
      });

      // 2. Create profile in our database
      const { password, ...userData } = dto;
      const referralCode = this.generateReferralCode(userData.firstName || 'USER');

      const user = await this.prisma.user.create({
        data: {
          ...userData,
          id: keycloakId, // Use Keycloak UUID as our DB primary key
          status: 'ACTIVE',
          referralCode,
        },
      });

      // 3. Handle referral if code provided
      if (providedCode) {
        await this.processReferral(user.id, providedCode);
      }

      // 4. Send welcome email
      this.sendWelcomeEmail(user.email, user.firstName || 'User');

      return user;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('Email already exists');
      }
      if (error.code === 'P2002') { // Prisma unique constraint error
        throw new ConflictException('User with this email already exists');
      }
      // Rethrow http exceptions
      if (error instanceof HttpException) {
        throw error;
      }
      // Default fallback
      throw new BadRequestException(error.message || 'Registration failed');
    }
  }

  // Encryption helpers
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(process.env.JWT_SECRET || 'secret', 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  private decrypt(text: string): string {
    const textParts = text.split(':');
    const ivHex = textParts.shift();
    if (!ivHex) throw new Error('Invalid encrypted text');

    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const key = crypto.scryptSync(process.env.JWT_SECRET || 'secret', 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  async login(credentials: { email: string; password: string }) {
    const tokens = await this.keycloakService.login(credentials);

    // Check local user for 2FA
    const user = await this.prisma.user.findUnique({ where: { email: credentials.email } });

    if (user && user.twoFactorEnabled) {
      const payload = JSON.stringify(tokens);
      const encryptedTokens = this.encrypt(payload);

      const tempToken = this.jwtService.sign({
        sub: user.id,
        temp_tokens: encryptedTokens,
        is_2fa_temp: true
      }, { expiresIn: '5m' });

      return {
        required2FA: true,
        tempToken,
        message: 'Two-factor authentication required'
      };
    }

    return tokens;
  }

  async verifyLoginTwoFactor(tempToken: string, code: string) {
    let payload;
    try {
      payload = this.jwtService.verify(tempToken);
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    if (!payload.is_2fa_temp) {
      throw new UnauthorizedException('Invalid token type');
    }

    const userId = payload.sub;
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.twoFactorSecret) {
      throw new UnauthorizedException('Invalid 2FA state');
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid authentication code');
    }

    const tokensFn = this.decrypt(payload.temp_tokens);
    return JSON.parse(tokensFn);
  }

  async forgotPassword(email: string) {
    return this.keycloakService.sendPasswordResetEmail(email);
  }

  async resendVerificationEmail(userId: string) {
    return this.keycloakService.sendVerificationEmail(userId);
  }

  create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll(page: number = 1, limit: number = 10, role?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (role) {
      where.roles = { has: role };
    }

    const [total, results] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          rating: 'desc',
        },
      }),
    ]);

    return {
      total,
      page,
      limit,
      results,
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    // 1. Get user to find email
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Verify current password
    try {
      await this.keycloakService.login({
        email: user.email,
        password: changePasswordDto.currentPassword
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid current password');
    }

    // 3. Update to new password
    await this.keycloakService.updatePassword(userId, changePasswordDto.newPassword);

    return { message: 'Password updated successfully' };
  }

  async setupTwoFactor(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'FreelanceHub', secret);
    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

    // Ideally, save the secret temporarily or in a pending state until verified.
    // For simplicity, we might save it directly but mark 2FA as disabled.
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret }
    });

    return { secret, qrCodeUrl };
  }

  async verifyTwoFactor(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('2FA initialization not found');
    }

    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret
    });

    if (!isValid) {
      throw new BadRequestException('Invalid authentication code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true }
    });

    return { message: '2FA enabled successfully' };
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
      // This happens when a user first logs in via Keycloak (e.g. social login)
      const kcUser = await this.keycloakService.getUserById(id);
      if (!kcUser) {
        throw new NotFoundException(`User with ID ${id} not found in database or Keycloak`);
      }

      const federated = await this.keycloakService.getFederatedIdentities(id);

      const socialIds: any = {};
      if (federated && federated.length > 0) {
        federated.forEach(identity => {
          if (identity.identityProvider === 'google') socialIds.googleId = identity.userId;
          if (identity.identityProvider === 'github') socialIds.githubId = identity.userId;
          if (identity.identityProvider === 'facebook') socialIds.facebookId = identity.userId;
        });
      }

      // Try to extract avatar from attributes (e.g. picture for Google)
      let avatarUrl = null;
      if (kcUser.attributes) {
        avatarUrl = kcUser.attributes.picture?.[0] || kcUser.attributes.avatar_url?.[0] || null;
      }

      user = await this.prisma.user.create({
        data: {
          id,
          email: kcUser.email,
          firstName: kcUser.firstName,
          lastName: kcUser.lastName,
          avatarUrl: avatarUrl,
          isEmailVerified: kcUser.emailVerified || false,
          status: 'ACTIVE',
          ...socialIds
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

  async update(id: string, updateUserDto: UpdateUserDto) {
    console.log('UPDATING USER:', id, JSON.stringify(updateUserDto));
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
    console.log('UPDATE RESULT:', JSON.stringify(user));
    await this.checkBadges(id);
    return user;
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

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        rating: newRating,
        reviewCount: newCount,
        jobSuccessScore: newJss
      }
    });

    await this.checkBadges(userId);
    return updatedUser;
  }

  async checkBadges(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        experience: true,
        education: true,
        portfolio: true
      }
    });

    if (!user) return;

    const newBadges: string[] = [];

    // 1. Identity & Payment
    if (user.isIdentityVerified) newBadges.push('IDENTITY_VERIFIED');
    if (user.isPaymentVerified) newBadges.push('PAYMENT_VERIFIED');

    // 2. Rating & Review counts
    if (Number(user.rating) >= 4.8 && user.reviewCount >= 10 && user.jobSuccessScore >= 90) {
      newBadges.push('TOP_RATED');
    } else if (Number(user.rating) >= 4.5 && user.reviewCount >= 3) {
      newBadges.push('RISING_STAR');
    }

    // 3. Profile Completeness
    if (user.completionPercentage >= 90) {
      newBadges.push('PROFILE_ORACLE');
    }

    // 4. Veteran (Experience)
    if (user.experience.length >= 3) {
      newBadges.push('VETERAN');
    }

    // Update if changed
    const currentBadges = user.badges || [];
    const changed = newBadges.length !== currentBadges.length ||
      !newBadges.every(b => currentBadges.includes(b));

    if (changed) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { badges: newBadges }
      });
    }
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

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        completionPercentage,
      },
    });
    await this.checkBadges(userId);
    return user;
  }

  public calculateCompletionPercentage(user: any): number {
    const commonFields = ['firstName', 'lastName', 'phone', 'country', 'avatarUrl'];
    const freelancerFields = ['title', 'overview', 'hourlyRate', 'skills'];
    const clientFields = ['companyName', 'industry'];

    const professionalFields: string[] = [];
    if (user.education?.length > 0) professionalFields.push('education');
    if (user.experience?.length > 0) professionalFields.push('experience');
    if (user.portfolio?.length > 0) professionalFields.push('portfolio');

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

    // Add bonus for professional history
    filled += professionalFields.length;
    const totalFields = fields.length + 3; // +3 for education, experience, portfolio

    return Math.round((filled / totalFields) * 100);
  }

  async socialOnboarding(userId: string, role: string) {
    const user = await this.findOne(userId);
    if (!user) throw new NotFoundException('User not found');

    // Only apply if user has default role or no roles
    // This prevents accidental role overwrites
    const currentRoles = user.roles || [];
    if (currentRoles.length <= 1) {
      // Update DB
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          roles: [role],
        },
      });

      // Sync to Keycloak
      try {
        await this.keycloakService.assignRole(userId, role);
      } catch (error) {
        console.error(`Failed to sync role ${role} to Keycloak for user ${userId}:`, error.message);
        // We don't throw here to avoid failing the DB update, 
        // but ideally it should be consistent.
      }
    }

    return { success: true, role };
  }

  async exportData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        education: true,
        experience: true,
        portfolio: true,
        teams: { include: { team: true } },
        ownedTeams: true,
      }
    });

    if (!user) throw new NotFoundException('User not found');

    // Remove sensitive data before export
    const { password, twoFactorSecret, ...safeData } = user;
    return safeData;
  }

  async deductConnects(userId: string, amount: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.availableConnects < amount) {
      throw new ForbiddenException('Insufficient connects');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { availableConnects: { decrement: amount } }
    });

    return { success: true, remaining: updatedUser.availableConnects };
  }

  async getAvailability(userId: string) {
    return this.prisma.availabilityCalendar.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });
  }

  async updateAvailability(userId: string, availabilityData: { date: string, isBusy: boolean, note?: string }[]) {
    // Delete existing for simplicity in this MVP or upsert
    // Let's use a transaction to delete and re-insert or use upsert.
    // Given it's a date-based calendar, upsert on (userId, date) is better.

    return this.prisma.$transaction(async (prisma) => {
      const results: any[] = [];
      for (const item of availabilityData) {
        const res = await prisma.availabilityCalendar.upsert({
          where: {
            userId_date: {
              userId,
              date: new Date(item.date),
            },
          },
          update: {
            isBusy: item.isBusy,
            note: item.note,
          },
          create: {
            userId,
            date: new Date(item.date),
            isBusy: item.isBusy,
            note: item.note,
          },
        });
        results.push(res);
      }
      return results;
    });
  }

  async processReferral(referredId: string, referralCode: string) {
    const referrer = await this.prisma.user.findUnique({
      where: { referralCode }
    });

    if (!referrer) {
      console.warn(`Invalid referral code provided: ${referralCode}`);
      return;
    }

    if (referrer.id === referredId) {
      console.warn(`User ${referredId} tried to refer themselves`);
      return;
    }

    try {
      await this.prisma.referral.create({
        data: {
          referrerId: referrer.id,
          referredId,
          status: 'COMPLETED',
          rewardAmount: 50.0, // Tracking reward
        }
      });

      // Award Connects
      // Referrer gets 50
      await this.prisma.user.update({
        where: { id: referrer.id },
        data: { availableConnects: { increment: 50 } }
      });

      // Referred user gets 20 bonus
      await this.prisma.user.update({
        where: { id: referredId },
        data: { availableConnects: { increment: 20 } }
      });

      console.log(`Referral processed for referredId: ${referredId} by referrerId: ${referrer.id}`);
    } catch (error) {
      console.error('Failed to process referral:', error.message);
    }
  }

  async getReferrals(userId: string) {
    return this.prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            createdAt: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
