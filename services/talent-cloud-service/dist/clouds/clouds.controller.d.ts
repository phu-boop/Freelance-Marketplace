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
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.InvitationStatus;
        cloudId: string;
        inviteeId: string;
        inviterId: string;
        email: string | null;
        expiresAt: Date | null;
    }>;
    getMyInvitations(user: any): Promise<({
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
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.InvitationStatus;
        cloudId: string;
        inviteeId: string;
        inviterId: string;
        email: string | null;
        expiresAt: Date | null;
    })[]>;
    respond(user: any, invitationId: string, dto: {
        accept: boolean;
    }): Promise<{
        success: boolean;
    }>;
    addMember(cloudId: string, dto: {
        userId: string;
        role?: 'ADMIN' | 'MEMBER';
    }): Promise<{
        id: string;
        userId: string;
        joinedAt: Date;
        role: import(".prisma/client").$Enums.CloudRole;
        status: import(".prisma/client").$Enums.MembershipStatus;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        cloudId: string;
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
        userId: string;
        joinedAt: Date;
        role: import(".prisma/client").$Enums.CloudRole;
        status: import(".prisma/client").$Enums.MembershipStatus;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        cloudId: string;
    })[]>;
    getOne(id: string): Promise<{
        members: {
            userProfile: any;
            id: string;
            userId: string;
            joinedAt: Date;
            role: import(".prisma/client").$Enums.CloudRole;
            status: import(".prisma/client").$Enums.MembershipStatus;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            cloudId: string;
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
