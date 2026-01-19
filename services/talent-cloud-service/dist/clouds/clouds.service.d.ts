import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
export declare class CloudsService {
    private prisma;
    private http;
    constructor(prisma: PrismaService, http: HttpService);
    createCloud(data: {
        name: string;
        description?: string;
        ownerId: string;
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
    inviteMember(cloudId: string, inviteeId: string, inviterId: string): Promise<any>;
    respondToInvitation(invitationId: string, userId: string, accept: boolean): Promise<{
        success: boolean;
    }>;
    getInvitations(userId: string): Promise<any>;
    addMember(cloudId: string, userId: string, role?: 'ADMIN' | 'MEMBER'): Promise<{
        id: string;
        cloudId: string;
        userId: string;
        joinedAt: Date;
        role: import(".prisma/client").$Enums.CloudRole;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    addMembersBulk(cloudId: string, userIds: string[], role?: 'ADMIN' | 'MEMBER'): Promise<{
        count: number;
    }>;
    removeMember(cloudId: string, userId: string): Promise<{
        success: boolean;
    }>;
    listCloudsForUser(userId: string): Promise<({
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
    getCloud(cloudId: string): Promise<{
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
    updateCloud(cloudId: string, data: {
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
    private getUserProfile;
    private notifyUserService;
}
