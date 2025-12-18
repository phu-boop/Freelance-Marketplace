import { OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
export declare class CommonService extends PrismaClient implements OnModuleInit {
    onModuleInit(): Promise<void>;
    getCategories(): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createCategory(data: {
        name: string;
        slug: string;
        description?: string;
    }): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getSkills(): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createSkill(data: {
        name: string;
        slug: string;
    }): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
