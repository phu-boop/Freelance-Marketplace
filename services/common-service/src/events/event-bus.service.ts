import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EventBusService implements OnModuleInit {
    private readonly logger = new Logger(EventBusService.name);

    constructor(private eventEmitter: EventEmitter2) { }

    onModuleInit() {
        this.logger.log('EventBus Initialized (Mocking RabbitMQ locally)');
    }

    /**
     * Publish an event to the "bus"
     */
    async publish(eventName: string, payload: any) {
        this.logger.log(`[EventBus] Publishing: ${eventName}`);
        this.eventEmitter.emit(eventName, payload);
        // In production: await this.rabbitMqClient.emit(eventName, payload);
    }

    /**
     * Subscribe to an event (Decorator approach strictly preferred in NestJS, but exposing helper)
     */
    subscribe(eventName: string, callback: (payload: any) => void) {
        this.eventEmitter.on(eventName, callback);
    }
}
