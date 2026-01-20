import { OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class EventBusService implements OnModuleInit {
    private eventEmitter;
    private readonly logger;
    constructor(eventEmitter: EventEmitter2);
    onModuleInit(): void;
    publish(eventName: string, payload: any): Promise<void>;
    subscribe(eventName: string, callback: (payload: any) => void): void;
}
