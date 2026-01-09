import { PrismaService } from '../prisma/prisma.service';
export declare class RegionalGatewayService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    processRegionalPayout(userId: string, amount: number, methodId: string): Promise<{
        success: boolean;
        txnId: string;
    }>;
    private processMomo;
    private processPix;
    private processPromptPay;
    private processMPesa;
}
