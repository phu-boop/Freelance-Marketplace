import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class PayrollSchedulerService {
    private paymentsService;
    private prisma;
    private readonly logger;
    constructor(paymentsService: PaymentsService, prisma: PrismaService);
    handlePayrollCycles(): Promise<void>;
}
