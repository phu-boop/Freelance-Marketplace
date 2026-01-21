import { CloudService } from './cloud.service';
export declare class CloudController {
    private readonly cloudService;
    constructor(cloudService: CloudService);
    createCloud(req: any, data: {
        name: string;
        description?: string;
        visibility: 'PRIVATE' | 'PUBLIC';
        costCenter?: string;
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
    getMyClouds(req: any): Promise<({
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
    getCloudDetails(id: string, req: any): Promise<{
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
    inviteMember(id: string, body: {
        email: string;
    }, req: any): Promise<{
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
    getMyInvitations(req: any): Promise<({
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
    acceptInvitation(invitationId: string, req: any): Promise<{
        success: boolean;
    }>;
}
