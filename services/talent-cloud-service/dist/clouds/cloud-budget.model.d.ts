export interface TalentCloudBudget {
    id: string;
    cloudId: string;
    totalAmount: number;
    allocatedAmount: number;
    remainingAmount: number;
    currency: string;
    fiscalYear: string;
    status: 'ACTIVE' | 'EXHAUSTED' | 'FROZEN';
}
export interface BudgetAllocation {
    id: string;
    budgetId: string;
    projectId?: string;
    amount: number;
    description: string;
    createdAt: Date;
}
