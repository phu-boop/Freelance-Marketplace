import { HttpService } from '@nestjs/axios';
export declare class CurrencyConverterService {
    private readonly httpService;
    private readonly logger;
    private rates;
    private lastFetch;
    private readonly CACHE_DURATION;
    constructor(httpService: HttpService);
    getExchangeRates(base?: string): Promise<Record<string, number>>;
    convert(amount: number, from: string, to: string): Promise<number>;
}
