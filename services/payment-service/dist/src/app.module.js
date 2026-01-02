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
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const payments_module_1 = require("./payments/payments.module");
const prisma_module_1 = require("./prisma/prisma.module");
const health_controller_1 = require("./health/health.controller");
const config_1 = require("@nestjs/config");
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const core_1 = require("@nestjs/core");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 10,
                }]),
            terminus_1.TerminusModule,
            payments_module_1.PaymentsModule,
            prisma_module_1.PrismaModule,
            nest_keycloak_connect_1.KeycloakConnectModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    authServerUrl: configService.get('KEYCLOAK_URL', 'http://keycloak:8080'),
                    realm: configService.get('KEYCLOAK_REALM', 'freelance-marketplace'),
                    clientId: configService.get('KEYCLOAK_CLIENT_ID', 'freelance-client'),
                    secret: configService.get('KEYCLOAK_SECRET', ''),
                    tokenValidation: nest_keycloak_connect_1.TokenValidation.OFFLINE,
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [app_controller_1.AppController, health_controller_1.HealthController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: nest_keycloak_connect_1.AuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: nest_keycloak_connect_1.ResourceGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: nest_keycloak_connect_1.RoleGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map