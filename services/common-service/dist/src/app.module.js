"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const terminus_1 = require("@nestjs/terminus");
const common_controller_1 = require("./common.controller");
const common_service_1 = require("./common.service");
const health_controller_1 = require("./health/health.controller");
const event_emitter_1 = require("@nestjs/event-emitter");
const event_bus_service_1 = require("./events/event-bus.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 10,
                }]),
            terminus_1.TerminusModule,
            event_emitter_1.EventEmitterModule.forRoot(),
        ],
        controllers: [common_controller_1.CommonController, health_controller_1.HealthController],
        providers: [common_service_1.CommonService, event_bus_service_1.EventBusService],
        exports: [event_bus_service_1.EventBusService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map