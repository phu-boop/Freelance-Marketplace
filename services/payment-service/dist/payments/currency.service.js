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
var CurrencyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let CurrencyService = CurrencyService_1 = class CurrencyService {
    httpService;
    configService;
    logger = new common_1.Logger(CurrencyService_1.name);
    apiUrl = 'https://openexchangerates.org/api/latest.json';
    cachedRates = {};
    lastFetchTime = 0;
    CACHE_TTL = 3600 * 1000;
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.cachedRates = {
            USD: 1,
            EUR: 0.92,
            GBP: 0.79,
            VND: 25400,
            INR: 83.5,
            KES: 130.0,
            BRL: 5.15,
            JPY: 155.0
        };
    }
    async convert(amount, from, to) {
        if (from === to)
            return amount;
        const rates = await this.getRates();
        const fromRate = rates[from];
        const toRate = rates[to];
        if (!fromRate || !toRate) {
            this.logger.warn(`Currency conversion failed: ${from} or ${to} not found.`);
            return amount;
        }
        const amountInUsd = amount / fromRate;
        return Number((amountInUsd * toRate).toFixed(2));
    }
    async format(amount, currency) {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
            }).format(amount);
        }
        catch (e) {
            return `${amount} ${currency}`;
        }
    }
    async getExchangeRates(base) {
        return this.getRates();
    }
    async getRates() {
        const now = Date.now();
        if (this.lastFetchTime + this.CACHE_TTL > now && Object.keys(this.cachedRates).length > 0) {
            return this.cachedRates;
        }
        const appId = this.configService.get('OPEN_EXCHANGE_RATES_APP_ID');
        if (!appId) {
            this.logger.debug('No OpenExchangeRates App ID found, using mock rates.');
            return this.cachedRates;
        }
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.apiUrl}?app_id=${appId}`));
            this.cachedRates = data.rates;
            this.lastFetchTime = now;
            this.logger.log('Updated FX rates from OpenExchangeRates.');
        }
        catch (error) {
            this.logger.error(`Failed to fetch FX rates: ${error.message}`);
        }
        return this.cachedRates;
    }
};
exports.CurrencyService = CurrencyService;
exports.CurrencyService = CurrencyService = CurrencyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], CurrencyService);
//# sourceMappingURL=currency.service.js.map