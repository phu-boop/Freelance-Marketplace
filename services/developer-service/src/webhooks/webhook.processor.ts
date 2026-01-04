import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

@Processor('webhooks')
export class WebhookProcessor extends WorkerHost {
    private readonly logger = new Logger(WebhookProcessor.name);

    constructor(private readonly httpService: HttpService) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        const { url, payload, secret, event } = job.data;

        this.logger.log(`Dispatching webhook ${event} to ${url}`);

        const signature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(payload))
            .digest('hex');

        try {
            await firstValueFrom(
                this.httpService.post(url, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Marketplace-Signature': signature,
                        'X-Marketplace-Event': event,
                    },
                    timeout: 5000,
                })
            );
            this.logger.log(`Successfully dispatched webhook to ${url}`);
        } catch (error) {
            this.logger.error(`Failed to dispatch webhook to ${url}: ${error.message}`);
            throw error; // Let BullMQ handle retries
        }
    }
}
