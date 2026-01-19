import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CurrencyConverterService {
  private readonly logger = new Logger(CurrencyConverterService.name);
  private rates: Record<string, number> = {};
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor(private readonly httpService: HttpService) { }

  async getExchangeRates(
    base: string = 'USD',
  ): Promise<Record<string, number>> {
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

      const response = await firstValueFrom(this.httpService.get(url));
      this.rates = response.data.rates;
      this.rates[base] = 1.0; // Base rate is always 1
      this.lastFetch = now;
      return this.rates;
    } catch (error) {
      this.logger.error(`Failed to fetch exchange rates: ${error.message}`);
      // Fallback rates for common currencies if API fails
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

  async convert(amount: number, from: string, to: string): Promise<number> {
    if (from === to) return amount;

    const rates = await this.getExchangeRates('USD');
    const fromRate = rates[from] || 1.0;
    const toRate = rates[to] || 1.0;

    // Convert to USD first, then to target currency
    const inUsd = amount / fromRate;
    const rawConverted = inUsd * toRate;

    // Apply 0.5% FX spread (Platform Profit Margin)
    // We take more from the user (charge) or give less (payout)
    // For simplicity, we just apply a fee to the final amount
    const SPREAD = 0.005;
    return rawConverted * (1 - SPREAD);
  }
}
