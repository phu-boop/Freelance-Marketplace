export declare enum CircuitState {
    CLOSED = "CLOSED",
    OPEN = "OPEN",
    HALF_OPEN = "HALF_OPEN"
}
export declare class CircuitBreaker {
    private readonly serviceName;
    private readonly failureThreshold;
    private readonly resetTimeout;
    private state;
    private failureCount;
    private lastFailureTime;
    private readonly logger;
    constructor(serviceName: string, failureThreshold?: number, resetTimeout?: number);
    execute<T>(action: () => Promise<T>): Promise<T>;
    private recordFailure;
    private trip;
    private reset;
}
