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

    async searchJobs(query: string, filters?: { types?: string, levels?: string, minSalary?: string }) {
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
        if (filters?.minSalary) {
            filter.push({ range: { salaryMin: { gte: parseInt(filters.minSalary) } } });
        }

        const result = await this.elasticsearchService.search({
            index: 'jobs',
            query: {
                bool: { must, filter },
            },
        });
        return result.hits.hits.map((hit) => hit._source);
    }

    async searchUsers(query: string) {
        const result = await this.elasticsearchService.search({
            index: 'users',
            query: {
                multi_match: {
                    query,
                    fields: ['name', 'bio', 'skills'],
                },
            },
        });
        return result.hits.hits.map((hit) => hit._source);
    }
}
