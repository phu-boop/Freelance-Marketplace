import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(private prisma: PrismaService) { }

  async recordLogin(
    userId: string,
    metadata: {
      ipAddress?: string;
      userAgent?: string;
      deviceId?: string;
      browser?: string;
      os?: string;
      status?: string;
    },
  ) {
    // 1. Record in Login History
    await this.prisma.userLoginHistory.create({
      data: {
        userId,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        status: metadata.status || 'SUCCESS',
        device: `${metadata.browser || 'Unknown'} on ${metadata.os || 'Unknown'}`,
      },
    });

    // 2. Manage Security Device
    if (metadata.deviceId) {
      await this.prisma.securityDevice.upsert({
        where: {
          userId_deviceId: { userId, deviceId: metadata.deviceId },
        },
        create: {
          userId,
          deviceId: metadata.deviceId,
          browser: metadata.browser,
          os: metadata.os,
          lastIp: metadata.ipAddress,
          lastUsedAt: new Date(),
        },
        update: {
          lastUsedAt: new Date(),
          lastIp: metadata.ipAddress,
          browser: metadata.browser,
          os: metadata.os,
        },
      });
    }

    this.logger.log(`Login recorded for user ${userId} from ${metadata.ipAddress}`);
  }

  async getSecurityContext(userId: string) {
    const [devices, history] = await Promise.all([
      this.prisma.securityDevice.findMany({
        where: { userId },
        orderBy: { lastUsedAt: 'desc' },
      }),
      this.prisma.userLoginHistory.findMany({
        where: { userId },
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { devices, history };
  }

  async revokeDevice(userId: string, deviceId: string) {
    return this.prisma.securityDevice.delete({
      where: {
        userId_deviceId: { userId, deviceId },
      },
    });
  }

  async revokeAllExcept(userId: string, currentDeviceId: string) {
    return this.prisma.securityDevice.deleteMany({
      where: {
        userId,
        deviceId: { not: currentDeviceId },
      },
    });
  }
}
