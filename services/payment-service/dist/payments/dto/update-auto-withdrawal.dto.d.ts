export declare class UpdateAutoWithdrawalDto {
    enabled: boolean;
    threshold?: string;
    schedule?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    methodId?: string;
}
