"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CacheInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
let CacheInterceptor = CacheInterceptor_1 = class CacheInterceptor {
    logger = new common_1.Logger(CacheInterceptor_1.name);
    cache = new Map();
    TTL_MS = 60 * 1000;
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        if (request.method !== 'GET') {
            return next.handle();
        }
        const key = this.generateKey(request);
        const cached = this.cache.get(key);
        if (cached) {
            if (Date.now() < cached.expires) {
                this.logger.log(`[Cache] HIT for ${key}`);
                return (0, rxjs_1.of)(cached.data);
            }
            else {
                this.logger.log(`[Cache] EXPIRED for ${key}`);
                this.cache.delete(key);
            }
        }
        this.logger.log(`[Cache] MISS for ${key}`);
        return next.handle().pipe((0, operators_1.tap)((data) => {
            this.cache.set(key, {
                data,
                expires: Date.now() + this.TTL_MS,
            });
        }));
    }
    generateKey(request) {
        return `${request.url}`;
    }
};
exports.CacheInterceptor = CacheInterceptor;
exports.CacheInterceptor = CacheInterceptor = CacheInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], CacheInterceptor);
//# sourceMappingURL=cache.interceptor.js.map