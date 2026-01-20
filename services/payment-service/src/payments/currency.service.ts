import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CurrencyService {
    private readonly logger = new Logger(CurrencyService.name);
    private readonly apiUrl = 'https://openexchangerates.org/api/latest.json';
    private cachedRates: Record<string, number> = {};
    private lastFetchTime: number = 0;
    private readonly CACHE_TTL = 3600 * 1000; // 1 hour

    constructor(
        private httpService: HttpService,
        private configService: ConfigService
    ) {
        // Initialize mock rates immediately in case API key is missing
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

    /**
     * Convert amount from one currency to another
     */
    async convert(amount: number, from: string, to: string): Promise<number> {
        if (from === to) return amount;

        const rates = await this.getRates();
        const fromRate = rates[from];
        const toRate = rates[to];

        if (!fromRate || !toRate) {
            this.logger.warn(`Currency conversion failed: ${from} or ${to} not found.`);
            return amount; // Fallback to 1:1 if rate unknown
        }

        // Convert to Base (USD), then to Target
        const amountInUsd = amount / fromRate;
        return Number((amountInUsd * toRate).toFixed(2));
    }

    /**
     * Get formatted string (e.g., "$100.00", "2.540.000 ₫")
     */
    async format(amount: number, currency: string): Promise<string> {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
            }).format(amount);
        } catch (e) {
            return `${amount} ${currency}`;
        }
    }

    async getExchangeRates(base?: string) {
        return this.getRates();
    }

    private async getRates() {
        const now = Date.now();
        if (this.lastFetchTime + this.CACHE_TTL > now && Object.keys(this.cachedRates).length > 0) {
            return this.cachedRates;
        }

        const appId = this.configService.get<string>('OPEN_EXCHANGE_RATES_APP_ID');
        if (!appId) {
            this.logger.debug('No OpenExchangeRates App ID found, using mock rates.');
            return this.cachedRates;
        }

        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${this.apiUrl}?app_id=${appId}`)
            );
            this.cachedRates = data.rates;
            this.lastFetchTime = now;
            this.logger.log('Updated FX rates from OpenExchangeRates.');
        } catch (error) {
            this.logger.error(`Failed to fetch FX rates: ${error.message}`);
        }

        return this.cachedRates;
    }
}
