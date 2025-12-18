import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    getWallet(userId: string): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deposit(body: {
        userId: string;
        amount: number;
        referenceId: string;
    }): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    withdraw(body: {
        userId: string;
        amount: number;
    }): Promise<{
        id: string;
        userId: string;
        balance: import("@prisma/client-runtime-utils").Decimal;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
