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
var CurrencyConverterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyConverterService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let CurrencyConverterService = CurrencyConverterService_1 = class CurrencyConverterService {
    httpService;
    logger = new common_1.Logger(CurrencyConverterService_1.name);
    rates = {};
    lastFetch = 0;
    CACHE_DURATION = 24 * 60 * 60 * 1000;
    constructor(httpService) {
        this.httpService = httpService;
    }
    async getExchangeRates(base = 'USD') {
        const now = Date.now();
        if (this.rates && now - this.lastFetch < this.CACHE_DURATION) {
            return this.rates;
        }
        try {
            this.logger.log(`Fetching latest exchange rates with base ${base}`);
            const appId = process.env.OPEN_EXCHANGE_RATES_APP_ID;
            let url = `https://api.frankfurter.app/latest?from=${base}`;
            if (appId) {
                url = `https://openexchangerates.org/api/latest.json?app_id=${appId}&base=${base}`;
            }
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url));
            this.rates = response.data.rates;
            this.rates[base] = 1.0;
            this.lastFetch = now;
            return this.rates;
        }
        catch (error) {
            this.logger.error(`Failed to fetch exchange rates: ${error.message}`);
            return {
                USD: 1.0,
                EUR: 0.92,
                GBP: 0.79,
                JPY: 150.0,
                CAD: 1.35,
                AUD: 1.52,
                VND: 24500.0,
                BRL: 4.95,
                THB: 35.5,
                KES: 160.0,
                NGN: 1400.0,
            };
        }
    }
    async convert(amount, from, to) {
        if (from === to)
            return amount;
        const rates = await this.getExchangeRates('USD');
        const fromRate = rates[from] || 1.0;
        const toRate = rates[to] || 1.0;
        const inUsd = amount / fromRate;
        return inUsd * toRate;
    }
};
exports.CurrencyConverterService = CurrencyConverterService;
exports.CurrencyConverterService = CurrencyConverterService = CurrencyConverterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService])
], CurrencyConverterService);
//# sourceMappingURL=currency-converter.service.js.map