import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly redisClient: Redis;
    private readonly logger = new Logger(RedisService.name);

    constructor(private readonly configService: ConfigService) {
        const host = this.configService.get<string>('REDIS_HOST', 'redis');
        const port = this.configService.get<number>('REDIS_PORT', 6379);

        this.redisClient = new Redis({
            host,
            port,
            retryStrategy: (times) => {
                // Exponential backoff with a cap of 2 seconds
                const delay = Math.min(times * 100, 2000);
                return delay;
            },
            maxRetriesPerRequest: null, // Keep retrying indefinitely
        });

        this.redisClient.on('connect', () => {
            this.logger.log(`Redis connected to ${host}:${port}`);
        });

        this.redisClient.on('error', (err) => {
            // Handle common startup errors as warnings instead of full errors to reduce noise
            const error = err as any;
            if (error.code === 'EAI_AGAIN' || error.code === 'ECONNREFUSED') {
                this.logger.warn(`Redis connection pending (${host}:${port}): ${error.message}`);
            } else {
                this.logger.error('Redis error', err);
            }
        });
    }

    async setUserOnline(userId: string) {
        // Set user status as online with a TTL (e.g., 5 minutes)
        // This TTL acts as a heartbeat/failsafe if disconnect is missed
        await this.redisClient.set(`user:status:${userId}`, 'online', 'EX', 300);
    }

    async setUserOffline(userId: string) {
        await this.redisClient.del(`user:status:${userId}`);
    }

    async isUserOnline(userId: string): Promise<boolean> {
        const status = await this.redisClient.get(`user:status:${userId}`);
        return status === 'online';
    }

    async onModuleDestroy() {
        await this.redisClient.quit();
    }
}
