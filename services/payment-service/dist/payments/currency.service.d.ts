import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class CurrencyService {
    private httpService;
    private configService;
    private readonly logger;
    private readonly apiUrl;
    private cachedRates;
    private lastFetchTime;
    private readonly CACHE_TTL;
    constructor(httpService: HttpService, configService: ConfigService);
    convert(amount: number, from: string, to: string): Promise<number>;
    format(amount: number, currency: string): Promise<string>;
    getExchangeRates(base?: string): Promise<Record<string, number>>;
    private getRates;
}
