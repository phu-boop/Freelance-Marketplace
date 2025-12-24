import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, ConflictException, HttpException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

import { PrismaService } from '../prisma/prisma.service';
import { KeycloakService } from '../keycloak/keycloak.service';

import * as qrcode from 'qrcode';
import { authenticator } from 'otplib';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private keycloakService: KeycloakService,
    private jwtService: JwtService
  ) { }

  async register(createUserDto: CreateUserDto) {
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
      const { password, ...userData } = createUserDto;
      return await this.prisma.user.create({
        data: {
          ...userData,
          id: keycloakId, // Use Keycloak UUID as our DB primary key
          status: 'ACTIVE'
        },
      });
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
}
