import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService {
    constructor(private readonly elasticsearchService: ElasticsearchService) { }

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
    }
}
