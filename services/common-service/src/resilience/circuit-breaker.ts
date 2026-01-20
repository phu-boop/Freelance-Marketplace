import { Logger } from '@nestjs/common';

export enum CircuitState {
    CLOSED = 'CLOSED',       // Normal operation
    OPEN = 'OPEN',           // Failing, reject all calls
    HALF_OPEN = 'HALF_OPEN', // Testing recovery
}

export class CircuitBreaker {
    private state = CircuitState.CLOSED;
    private failureCount = 0;
    private lastFailureTime = 0;
    private readonly logger = new Logger(CircuitBreaker.name);

    constructor(
        private readonly serviceName: string,
        private readonly failureThreshold = 5,
        private readonly resetTimeout = 10000 // 10 seconds
    ) { }

    async execute<T>(action: () => Promise<T>): Promise<T> {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() - this.lastFailureTime > this.resetTimeout) {
                this.state = CircuitState.HALF_OPEN;
                this.logger.warn(`Circuit for ${this.serviceName} is HALF-OPEN. Testing recovery...`);
            } else {
                throw new Error(`Circuit for ${this.serviceName} is OPEN. Fast failing.`);
            }
        }

        try {
            const result = await action();
            if (this.state === CircuitState.HALF_OPEN) {
                this.reset();
            }
            return result;
        } catch (error) {
            this.recordFailure();
            throw error;
        }
    }

    private recordFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();

        if (this.state === CircuitState.HALF_OPEN || this.failureCount >= this.failureThreshold) {
            this.trip();
        }
    }

    private trip() {
        this.state = CircuitState.OPEN;
        this.logger.error(`Circuit for ${this.serviceName} is now OPEN. Too many failures.`);
    }

    private reset() {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.logger.log(`Circuit for ${this.serviceName} is now CLOSED. Recovered.`);
    }
}
