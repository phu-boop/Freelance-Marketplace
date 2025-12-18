import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentsService {
    private prisma;
    constructor(prisma: PrismaService);
    createWallet(userId: string): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getWallet(userId: string): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deposit(userId: string, amount: number, referenceId: string): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    withdraw(userId: string, amount: number): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
