import { CloudsService } from './clouds.service';
export declare class CloudsController {
    private readonly cloudsService;
    constructor(cloudsService: CloudsService);
    getMyClouds(user: any): Promise<({
        _count: {
            members: number;
        };
    } & {
        id: string;
        name: string;
        description: string | null;
        ownerId: string;
        visibility: import(".prisma/client").$Enums.Visibility;
        costCenter: string | null;
        budget: number | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
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
        inviteeId: string;
        inviterId: string;
        email: string | null;
        status: import(".prisma/client").$Enums.InvitationStatus;
        expiresAt: Date | null;
        cloudId: string;
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
        inviteeId: string;
        inviterId: string;
        email: string | null;
        status: import(".prisma/client").$Enums.InvitationStatus;
        expiresAt: Date | null;
        cloudId: string;
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
        status: import(".prisma/client").$Enums.MembershipStatus;
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
        successfulCount: number;
        errors: any[];
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
        status: import(".prisma/client").$Enums.MembershipStatus;
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
            status: import(".prisma/client").$Enums.MembershipStatus;
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
