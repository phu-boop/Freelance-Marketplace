"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TaxCalculationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxCalculationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const library_1 = require("@prisma/client/runtime/library");
let TaxCalculationService = TaxCalculationService_1 = class TaxCalculationService {
    prisma;
    logger = new common_1.Logger(TaxCalculationService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async calculateTax(amount, countryCode) {
        const taxSetting = await this.prisma.taxSetting.findUnique({
            where: { countryCode },
        });
        if (!taxSetting || !taxSetting.isActive) {
            this.logger.warn(`No active tax setting found for country: ${countryCode}. Defaulting to 0%.`);
            return {
                taxAmount: new library_1.Decimal(0),
                taxRate: 0,
            };
        }
        const rate = Number(taxSetting.taxRate);
        const taxAmount = new library_1.Decimal(amount).mul(rate).div(100);
        return {
            taxAmount,
            taxRate: rate,
        };
    }
};
exports.TaxCalculationService = TaxCalculationService;
exports.TaxCalculationService = TaxCalculationService = TaxCalculationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TaxCalculationService);
//# sourceMappingURL=tax-calculation.service.js.map