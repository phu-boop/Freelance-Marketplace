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

    async searchJobs(query: string) {
        const result = await this.elasticsearchService.search({
            index: 'jobs',
            query: {
                multi_match: {
                    query,
                    fields: ['title', 'description', 'skills'],
                },
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
