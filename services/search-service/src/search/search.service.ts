import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService implements OnModuleInit {
    private readonly logger = new Logger(SearchService.name);

    constructor(private readonly elasticsearchService: ElasticsearchService) { }

    async onModuleInit() {
        await this.initializeIndices();
    }

    private async initializeIndices() {
        const indices = ['jobs', 'users'];
        for (const index of indices) {
            try {
                const exists = await this.elasticsearchService.indices.exists({ index });
                if (!exists) {
                    await this.elasticsearchService.indices.create({ index });
                    this.logger.log(`Created index: ${index}`);
                }
            } catch (error) {
                this.logger.error(`Error initializing index ${index}:`, error);
            }
        }
    }

    async indexJob(job: any) {
        return this.elasticsearchService.index({
            index: 'jobs',
            id: job.id,
            document: job,
        });
    }

    async indexUser(user: any) {
        return this.elasticsearchService.index({
            index: 'users',
            id: user.id,
            document: user,
        });
    }

    async searchJobs(query: string, filters?: {
        types?: string,
        levels?: string,
        minSalary?: string,
        maxSalary?: string,
        location?: string,
        page?: number,
        limit?: number
    }) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 10;
        const from = (page - 1) * limit;

        const must: any[] = [];
        if (query) {
            must.push({
                multi_match: {
                    query,
                    fields: ['title', 'description', 'skills'],
                },
            });
        } else {
            must.push({ match_all: {} });
        }

        const filter: any[] = [];
        if (filters?.types) {
            filter.push({ terms: { type: filters.types.split(',') } });
        }
        if (filters?.levels) {
            filter.push({ terms: { experienceLevel: filters.levels.split(',') } });
        }

        if (filters?.minSalary || filters?.maxSalary) {
            const range: any = {};
            if (filters.minSalary) range.gte = parseInt(filters.minSalary);
            if (filters.maxSalary) range.lte = parseInt(filters.maxSalary);
            filter.push({ range: { budget: range } });
        }

        if (filters?.location) {
            must.push({
                match: {
                    location: {
                        query: filters.location,
                        fuzziness: 'AUTO'
                    }
                }
            });
        }

        try {
            const result = await this.elasticsearchService.search({
                index: 'jobs',
                from,
                size: limit,
                query: {
                    bool: { must, filter },
                },
            });

            const total = typeof result.hits.total === 'number'
                ? result.hits.total
                : (result.hits.total as any).value;

            return {
                total,
                page,
                limit,
                results: result.hits.hits.map((hit) => hit._source),
            };
        } catch (error) {
            if ((error as any)?.meta?.body?.error?.type === 'index_not_found_exception') {
                this.logger.warn('Jobs index not found, returning empty result');
                return { total: 0, page, limit, results: [] };
            }
            throw error;
        }
    }

    async searchUsers(query: string, page: number = 1, limit: number = 10) {
        const from = (page - 1) * limit;

        const must: any[] = [];
        if (query) {
            must.push({
                multi_match: {
                    query,
                    fields: ['firstName', 'lastName', 'title', 'overview', 'skills'],
                    fuzziness: 'AUTO'
                },
            });
        } else {
            must.push({ match_all: {} });
        }

        try {
            const result = await this.elasticsearchService.search({
                index: 'users',
                from,
                size: limit,
                query: {
                    bool: { must },
                },
            });

            const total = typeof result.hits.total === 'number'
                ? result.hits.total
                : (result.hits.total as any).value;

            return {
                total,
                page,
                limit,
                results: result.hits.hits.map((hit) => hit._source),
            };
        } catch (error) {
            if ((error as any)?.meta?.body?.error?.type === 'index_not_found_exception') {
                this.logger.warn('Users index not found, returning empty result');
                return { total: 0, page, limit, results: [] };
            }
            throw error;
        }
    }
}
