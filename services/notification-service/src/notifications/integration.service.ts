import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { Integration, IntegrationDocument } from './schemas/integration.schema';

@Injectable()
export class IntegrationService {
    private readonly logger = new Logger(IntegrationService.name);

    constructor(
        @InjectModel(Integration.name)
        private integrationModel: Model<IntegrationDocument>,
        private httpService: HttpService,
    ) { }

    async create(userId: string, data: any): Promise<Integration> {
        const integration = new this.integrationModel({
            userId,
            ...data,
        });
        return integration.save();
    }

    async findAll(userId: string): Promise<Integration[]> {
        return this.integrationModel.find({ userId }).exec();
    }

    async remove(userId: string, id: string): Promise<any> {
        return this.integrationModel.deleteOne({ _id: id, userId }).exec();
    }

    async dispatch(userId: string, notification: any): Promise<void> {
        const integrations = await this.integrationModel.find({
            userId,
            isActive: true,
            // For simplicity, we dispatch all unless filtered. 
            // In a real app, verify: events: { $in: [notification.type] }
        }).exec();

        const dispatches = integrations.map(async (integration) => {
            try {
                const payload = this.formatPayload(integration.provider, notification);
                await lastValueFrom(this.httpService.post(integration.webhookUrl, payload));
            } catch (error: any) {
                this.logger.error(`Failed to dispatch to ${integration.provider} for user ${userId}: ${error.message}`);
            }
        });

        await Promise.all(dispatches);
    }

    private formatPayload(provider: string, notification: any): any {
        const text = `**${notification.title}**\n${notification.message}\n${notification.link || ''}`;

        if (provider === 'slack') {
            return { text };
        } else if (provider === 'discord') {
            return { content: text };
        }
        return { text };
    }
}
