import { CloudsService } from './clouds.service';
export declare class CloudsController {
    private readonly cloudsService;
    constructor(cloudsService: CloudsService);
    create(dto: {
        name: string;
        description?: string;
        ownerId: string;
        visibility?: 'PRIVATE' | 'PUBLIC';
    }): Promise<{
        id: string;
        name: string;
        description: string | null;
        ownerId: string;
        visibility: import(".prisma/client").$Enums.Visibility;
        costCenter: string | null;
        budget: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    invite(req: any, cloudId: string, dto: {
        userId: string;
    }): Promise<any>;
    getMyInvitations(req: any): Promise<any>;
    respond(req: any, invitationId: string, dto: {
        accept: boolean;
    }): Promise<{
        success: boolean;
    }>;
    addMember(cloudId: string, dto: {
        userId: string;
        role?: 'ADMIN' | 'MEMBER';
    }): Promise<{
        id: string;
        cloudId: string;
        userId: string;
        joinedAt: Date;
        role: import(".prisma/client").$Enums.CloudRole;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    addMembersBulk(cloudId: string, dto: {
        userIds: string[];
        role?: 'ADMIN' | 'MEMBER';
    }): Promise<{
        count: number;
    }>;
    removeMember(cloudId: string, userId: string): Promise<{
        success: boolean;
    }>;
    listForUser(userId: string): Promise<({
        cloud: {
            id: string;
            name: string;
            description: string | null;
            ownerId: string;
            visibility: import(".prisma/client").$Enums.Visibility;
            costCenter: string | null;
            budget: number | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        cloudId: string;
        userId: string;
        joinedAt: Date;
        role: import(".prisma/client").$Enums.CloudRole;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    getOne(id: string): Promise<{
        members: {
            userProfile: any;
            id: string;
            cloudId: string;
            userId: string;
            joinedAt: Date;
            role: import(".prisma/client").$Enums.CloudRole;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        id: string;
        name: string;
        description: string | null;
        ownerId: string;
        visibility: import(".prisma/client").$Enums.Visibility;
        costCenter: string | null;
        budget: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: {
        name?: string;
        description?: string;
        visibility?: 'PRIVATE' | 'PUBLIC';
        costCenter?: string;
        budget?: number;
    }): Promise<{
        id: string;
        name: string;
        description: string | null;
        ownerId: string;
        visibility: import(".prisma/client").$Enums.Visibility;
        costCenter: string | null;
        budget: number | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
