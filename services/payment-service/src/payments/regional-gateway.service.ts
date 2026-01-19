import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RegionalGatewayService {
  private readonly logger = new Logger(RegionalGatewayService.name);

  constructor(private prisma: PrismaService) {}

  async processRegionalPayout(
    userId: string,
    amount: number,
    methodId: string,
  ) {
    const method = await this.prisma.withdrawalMethod.findUnique({
      where: { id: methodId },
    });

    if (!method || method.userId !== userId) {
      throw new BadRequestException('Invalid withdrawal method');
    }

    this.logger.log(
      `Processing ${method.type} payout for user ${userId} via ${method.provider || 'default'}`,
    );

    // Dispatch based on Type
    switch (method.type) {
      case 'MOMO': // Vietnam / Africa
        return this.processMomo(amount, method.accountNumber);
      case 'PIX': // Brazil
        return this.processPix(amount, method.accountNumber);
      case 'PROMPTPAY': // Thailand
        return this.processPromptPay(amount, method.accountNumber);
      case 'M_PESA': // Kenya / Africa
        return this.processMPesa(amount, method.accountNumber);
      case 'WISE':
        return this.processWise(amount, method.accountNumber);
      case 'PAYONEER':
        return this.processPayoneer(amount, method.accountNumber);
      default:
        throw new BadRequestException(
          `Regional gateway for ${method.type} not implemented`,
        );
    }
  }

  private async processWise(amount: number, email: string) {
    // Mock Wise Payout API
    this.logger.log(`[Wise] Sending ${amount} to ${email}`);
    return { success: true, txnId: `WISE_${Date.now()}` };
  }

  private async processPayoneer(amount: number, email: string) {
    // Mock Payoneer Payout API
    this.logger.log(`[Payoneer] Sending ${amount} to ${email}`);
    return { success: true, txnId: `PAYO_${Date.now()}` };
  }

  private async processMomo(amount: number, phone: string) {
    // Mock API call to Momo
    this.logger.log(`[Momo] Sending ${amount} to ${phone}`);
    return { success: true, txnId: `MOMO_${Date.now()}` };
  }

  private async processPix(amount: number, key: string) {
    // Mock API call to Pix (BCB)
    this.logger.log(`[Pix] Sending ${amount} to key ${key}`);
    return { success: true, txnId: `PIX_${Date.now()}` };
  }

  private async processPromptPay(amount: number, id: string) {
    // Mock PromptPay API
    this.logger.log(`[PromptPay] Sending ${amount} to ${id}`);
    return { success: true, txnId: `PP_${Date.now()}` };
  }

  private async processMPesa(amount: number, phone: string) {
    // Mock Daraja API (Safaricom)
    this.logger.log(`[M-Pesa] Sending ${amount} to ${phone}`);
    return { success: true, txnId: `MPESA_${Date.now()}` };
  }
}
