import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class SubscriptionSchedulerService {
    private prisma;
    private paymentsService;
    private readonly logger;
    constructor(prisma: PrismaService, paymentsService: PaymentsService);
    handleSubscriptionRenewals(): Promise<void>;
}
