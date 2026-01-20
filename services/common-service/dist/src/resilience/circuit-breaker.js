"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = exports.CircuitState = void 0;
const common_1 = require("@nestjs/common");
var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["OPEN"] = "OPEN";
    CircuitState["HALF_OPEN"] = "HALF_OPEN";
})(CircuitState || (exports.CircuitState = CircuitState = {}));
class CircuitBreaker {
    serviceName;
    failureThreshold;
    resetTimeout;
    state = CircuitState.CLOSED;
    failureCount = 0;
    lastFailureTime = 0;
    logger = new common_1.Logger(CircuitBreaker.name);
    constructor(serviceName, failureThreshold = 5, resetTimeout = 10000) {
        this.serviceName = serviceName;
        this.failureThreshold = failureThreshold;
        this.resetTimeout = resetTimeout;
    }
    async execute(action) {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() - this.lastFailureTime > this.resetTimeout) {
                this.state = CircuitState.HALF_OPEN;
                this.logger.warn(`Circuit for ${this.serviceName} is HALF-OPEN. Testing recovery...`);
            }
            else {
                throw new Error(`Circuit for ${this.serviceName} is OPEN. Fast failing.`);
            }
        }
        try {
            const result = await action();
            if (this.state === CircuitState.HALF_OPEN) {
                this.reset();
            }
            return result;
        }
        catch (error) {
            this.recordFailure();
            throw error;
        }
    }
    recordFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.state === CircuitState.HALF_OPEN || this.failureCount >= this.failureThreshold) {
            this.trip();
        }
    }
    trip() {
        this.state = CircuitState.OPEN;
        this.logger.error(`Circuit for ${this.serviceName} is now OPEN. Too many failures.`);
    }
    reset() {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.logger.log(`Circuit for ${this.serviceName} is now CLOSED. Recovered.`);
    }
}
exports.CircuitBreaker = CircuitBreaker;
//# sourceMappingURL=circuit-breaker.js.map