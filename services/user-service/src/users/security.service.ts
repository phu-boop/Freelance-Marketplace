import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(private prisma: PrismaService) {}

  async validateDevice(
    userId: string,
    deviceId: string,
    metadata: { deviceName?: string; ipAddress?: string; userAgent?: string },
  ) {
    let device = await this.prisma.trustedDevice.findUnique({
      where: {
        userId_deviceId: { userId, deviceId },
      },
    });

    if (!device) {
      // New Device Detected
      const deviceCount = await this.prisma.trustedDevice.count({
        where: { userId },
      });
      const trustScore = deviceCount > 5 ? 50 : 90; // Lower score if user has many devices

      device = await this.prisma.trustedDevice.create({
        data: {
          userId,
          deviceId,
          deviceName: metadata.deviceName || 'Unknown Device',
          trustScore,
        },
      });

      this.logger.log(
        `New device registered for user ${userId}: ${deviceId} (Score: ${trustScore})`,
      );
    } else {
      // Existing Device, update last login
      await this.prisma.trustedDevice.update({
        where: { id: device.id },
        data: { lastLoginAt: new Date() },
      });
    }

    if (device.isBlocked || device.trustScore < 30) {
      this.logger.warn(
        `Blocked login attempt from device ${deviceId} for user ${userId}`,
      );
      return { isBlocked: true, reason: 'Device Risk Score too high' };
    }

    return { isBlocked: false, device };
  }

  async blockDevice(userId: string, deviceId: string) {
    return this.prisma.trustedDevice.update({
      where: { userId_deviceId: { userId, deviceId } },
      data: { isBlocked: true, trustScore: 0 },
    });
  }
}
