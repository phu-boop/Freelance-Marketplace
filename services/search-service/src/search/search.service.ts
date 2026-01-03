import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SearchService implements OnModuleInit {
    private readonly logger = new Logger(SearchService.name);

    constructor(
        private readonly elasticsearchService: ElasticsearchService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ) { }

    async onModuleInit() {
        await this.initializeIndices();
    }

    private async initializeIndices() {
        const indices = ['jobs', 'users'];
        for (const index of indices) {
            try {
                const exists = await this.elasticsearchService.indices.exists({ index });
                if (!exists) {
                    const body: any = { index };
                    if (index === 'jobs') {
                        body.mappings = {
                            properties: {
                                id: { type: 'keyword' },
                                categoryId: { type: 'keyword' },
                                status: { type: 'keyword' },
                                type: { type: 'keyword' },
                                experienceLevel: { type: 'keyword' },
                                budget: { type: 'integer' },
                                skills: { type: 'keyword' },
                                createdAt: { type: 'date' },
                                title: { type: 'text' },
                                description: { type: 'text' },
                                location: { type: 'text' },
                                category: { type: 'text' },
                                isPromoted: { type: 'boolean' }
                            }
                        };
                    }
                    await this.elasticsearchService.indices.create(body);
                    this.logger.log(`Created index: ${index}`);
                }
            } catch (error) {
                this.logger.error(`Error initializing index ${index}:`, error);
            }
        }
    }

    async indexJob(job: any) {
        this.logger.log(`Indexing job ${job.id}: ${job.title}`);
        return this.elasticsearchService.index({
            index: 'jobs',
            id: job.id,
            document: job,
        });
    }

    async indexUser(user: any) {
        this.logger.log(`Indexing user ${user.id}: ${user.email}`);
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
        categoryId?: string,
        skills?: string,
        sortBy?: string,
        sortOrder?: 'asc' | 'desc',
        postedWithin?: string,
        page?: number,
        limit?: number
    }) {
        const page = Number(filters?.page) || 1;
        const limit = Number(filters?.limit) || 10;
        const from = (page - 1) * limit;

        const must: any[] = [];
        if (query) {
            must.push({
                multi_match: {
                    query,
                    fields: ['title^3', 'description', 'skills^2', 'category'],
                    fuzziness: 'AUTO'
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
        if (filters?.categoryId) {
            filter.push({ term: { categoryId: filters.categoryId } });
        }
        if (filters?.skills) {
            const skillList = filters.skills.split(',');
            filter.push({ terms: { skills: skillList } });
        }

        if (filters?.minSalary || filters?.maxSalary) {
            const range: any = {};
            if (filters.minSalary) range.gte = parseInt(filters.minSalary);
            if (filters.maxSalary) range.lte = parseInt(filters.maxSalary);
            filter.push({ range: { budget: range } });
        }

        if (filters?.postedWithin) {
            const now = new Date();
            let gte: Date | null = null;
            switch (filters.postedWithin) {
                case '24h':
                    gte = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case '3d':
                    gte = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
                    break;
                case '7d':
                    gte = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    gte = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    gte = null;
            }
            if (gte) {
                filter.push({ range: { createdAt: { gte: gte.toISOString() } } });
            }
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

        // Only show OPEN jobs by default if needed, or filter by status
        filter.push({ term: { status: 'OPEN' } });

        const sort: any[] = [];
        // Prioritize promoted jobs
        sort.push({ isPromoted: { order: 'desc' } });

        if (filters?.sortBy) {
            sort.push({ [filters.sortBy]: { order: filters.sortOrder || 'desc' } });
        } else {
            sort.push({ createdAt: { order: 'desc' } });
        }

        try {
            const result = await this.elasticsearchService.search({
                index: 'jobs',
                from,
                size: limit,
                query: {
                    bool: { must, filter },
                },
                sort
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
            this.logger.error('Search failed:', error);
            return { total: 0, page, limit, results: [] };
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

    async getRecommendedJobs(userId: string, limit: number = 5) {
        try {
            // 1. Fetch user profile from user-service
            const userServiceUrl = this.configService.get<string>('USER_SERVICE_INTERNAL_URL', 'http://user-service:3000');
            const { data: user } = await firstValueFrom(
                this.httpService.get(`${userServiceUrl}/api/users/${userId}`)
            );

            if (!user) {
                this.logger.warn(`User ${userId} not found for recommendations`);
                return { total: 0, results: [] };
            }

            const { skills, primaryCategoryId, experienceLevel, title } = user;

            // 2. Build recommendations query
            const should: any[] = [];

            // Boost promoted jobs
            should.push({
                term: { isPromoted: { value: true, boost: 3.0 } }
            });

            if (skills && skills.length > 0) {
                // Try matching skills exactly (keywords)
                should.push({
                    terms: { skills: skills, boost: 2.0 }
                });
            }

            if (primaryCategoryId) {
                should.push({
                    term: { categoryId: { value: primaryCategoryId, boost: 1.5 } }
                });
            }

            if (title) {
                // Match user title against job title (fuzzy/text)
                should.push({
                    match: {
                        title: {
                            query: title,
                            boost: 1.5,
                            fuzziness: 'AUTO'
                        }
                    }
                });
            }

            // Match experience level if provided in job
            if (experienceLevel) {
                should.push({
                    term: { experienceLevel: { value: experienceLevel, boost: 1.0 } }
                });
            }

            const query: any = {
                bool: {
                    must: [
                        { term: { status: 'OPEN' } }
                    ],
                    should,
                }
            };

            // If we have profile data, we can require at least one match
            if (should.length > 0) {
                query.bool.minimum_should_match = 1;
            }

            const result = await this.elasticsearchService.search({
                index: 'jobs',
                size: limit,
                query,
                sort: [
                    { _score: { order: 'desc' } },
                    { createdAt: { order: 'desc' } }
                ]
            });

            const total = typeof result.hits.total === 'number'
                ? result.hits.total
                : (result.hits.total as any).value;

            return {
                total,
                limit,
                results: result.hits.hits.map((hit) => hit._source),
            };
        } catch (error) {
            this.logger.error(`Failed to get recommendations for user ${userId}:`, error.message);
            // Fallback: return recent jobs
            return this.searchJobs('', { limit });
        }
    }
}
