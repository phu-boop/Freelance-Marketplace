import { PrismaService } from '../prisma/prisma.service';
import { Visibility } from '@prisma/client';
export declare class CloudService {
    private prisma;
    constructor(prisma: PrismaService);
    createCloud(data: {
        name: string;
        description?: string;
        visibility: Visibility;
        costCenter?: string;
        ownerId: string;
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
    getCloudsForUser(userId: string): Promise<({
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
    getCloudDetails(cloudId: string, userId: string): Promise<{
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
    inviteMember(cloudId: string, email: string, inviterId: string): Promise<{
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
    getInvitationsForUser(userId: string, email?: string): Promise<({
        cloud: {
            name: string;
            ownerId: string;
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
    acceptInvitation(invitationId: string, userId: string): Promise<{
        success: boolean;
    }>;
}
