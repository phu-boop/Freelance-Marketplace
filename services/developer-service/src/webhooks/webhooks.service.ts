import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
    private readonly logger = new Logger(WebhooksService.name);

    constructor(
        private prisma: PrismaService,
        @InjectQueue('webhooks') private webhookQueue: Queue,
    ) { }

    async dispatch(event: string, payload: any) {
        this.logger.log(`Dispatching event ${event}`);

        const subscriptions = await this.prisma.webhookSubscription.findMany({
            where: {
                events: { has: event },
                isActive: true,
            },
        });

        for (const sub of subscriptions) {
            await this.webhookQueue.add('dispatch', {
                url: sub.targetUrl,
                payload,
                secret: sub.secret,
                event,
            });
        }
    }

    async subscribe(ownerId: string, data: { appId: string; targetUrl: string; events: string[] }) {
        // Verify ownership
        const app = await this.prisma.developerApp.findFirst({
            where: { id: data.appId, ownerId },
        });
        if (!app) throw new NotFoundException('App not found or not owned by you');

        const secret = crypto.randomBytes(32).toString('hex');

        return this.prisma.webhookSubscription.create({
            data: {
                appId: data.appId,
                targetUrl: data.targetUrl,
                events: data.events,
                secret,
            },
        });
    }

    async findAllByApp(appId: string, ownerId: string) {
        const app = await this.prisma.developerApp.findFirst({
            where: { id: appId, ownerId },
        });
        if (!app) throw new NotFoundException('App not found or not owned by you');

        return this.prisma.webhookSubscription.findMany({
            where: { appId },
        });
    }

    async delete(id: string, ownerId: string) {
        const sub = await this.prisma.webhookSubscription.findUnique({
            where: { id },
            include: { app: true },
        });

        if (!sub || sub.app.ownerId !== ownerId) {
            throw new ForbiddenException('Not authorized to delete this subscription');
        }

        return this.prisma.webhookSubscription.delete({ where: { id } });
    }
}
