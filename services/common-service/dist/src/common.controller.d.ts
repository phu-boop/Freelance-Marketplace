import { CommonService } from './common.service';
export declare class CommonController {
    private readonly commonService;
    constructor(commonService: CommonService);
    getCategories(): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createCategory(body: {
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
    createSkill(body: {
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
