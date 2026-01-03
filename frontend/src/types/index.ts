export enum UserRole {
    FREELANCER = 'FREELANCER',
    CLIENT = 'CLIENT',
    ADMIN = 'ADMIN',
}

export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    isEmailVerified?: boolean;
    roles: UserRole[];
    status: string;
    isAvailable: boolean;
    title?: string;
    overview?: string;
    hourlyRate?: number;
    skills: string[];
    completionPercentage: number;
    availableConnects: number;
    companyName?: string;
    isPaymentVerified: boolean;
    rating: number;
    reviewCount: number;
    jobSuccessScore: number;
}

export enum JobStatus {
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CLOSED = 'CLOSED',
    REJECTED = 'REJECTED',
}

export interface Job {
    id: string;
    title: string;
    description: string;
    budget?: number;
    client_id: string;
    status: JobStatus;
    categoryId?: string;
    skills: string[];
    type: 'FIXED_PRICE' | 'HOURLY';
    experienceLevel: 'ENTRY' | 'MID' | 'EXPERT';
    locationType: 'REMOTE' | 'ONSITE' | 'HYBRID';
    location?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Proposal {
    id: string;
    job_id: string;
    freelancer_id: string;
    coverLetter: string;
    bidAmount: number;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
    isShortlisted: boolean;
    estimatedDuration?: string;
    createdAt: string;
}

export interface Contract {
    id: string;
    job_id: string;
    freelancer_id: string;
    client_id: string;
    totalAmount: number;
    status: 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'DISPUTED';
    escrowStatus: 'PENDING' | 'FUNDED' | 'RELEASED' | 'REFUNDED';
    startDate: string;
    endDate?: string;
}

export interface Wallet {
    userId: string;
    balance: number;
    currency: string;
}

export interface Transaction {
    id: string;
    amount: number;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'FEE' | 'CONNECTS_PURCHASE';
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    createdAt: string;
}
