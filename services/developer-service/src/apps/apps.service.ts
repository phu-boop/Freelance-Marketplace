import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { KeycloakService } from '../keycloak/keycloak.service';

@Injectable()
export class AppsService {
    constructor(
        private prisma: PrismaService,
        private keycloakService: KeycloakService,
    ) { }

    async create(ownerId: string, data: { name: string; redirectUris: string[] }) {
        // 1. Create client in Keycloak
        const clientId = `mp-${Math.random().toString(36).substring(2, 10)}`;
        const keycloakClient = await this.keycloakService.createClient({
            clientId,
            name: data.name,
            redirectUris: data.redirectUris,
        });

        // 2. Persist in local DB
        return this.prisma.developerApp.create({
            data: {
                name: data.name,
                ownerId,
                clientId,
                clientSecret: keycloakClient.secret,
                redirectUris: data.redirectUris,
            },
        });
    }

    async findAllByOwner(ownerId: string) {
        return this.prisma.developerApp.findMany({
            where: { ownerId },
            include: { webhooks: true },
        });
    }

    async findOne(id: string, ownerId: string) {
        const app = await this.prisma.developerApp.findFirst({
            where: { id, ownerId },
            include: { webhooks: true },
        });
        if (!app) throw new NotFoundException('App not found');
        return app;
    }

    async delete(id: string, ownerId: string) {
        const app = await this.findOne(id, ownerId);
        return this.prisma.developerApp.delete({ where: { id: app.id } });
    }
}
