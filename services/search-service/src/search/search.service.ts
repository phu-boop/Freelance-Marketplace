import { Injectable, OnModuleInit, Logger, Inject } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import Redis from 'ioredis';
import * as crypto from 'crypto';

@Injectable()
export class SearchService implements OnModuleInit {
    private readonly logger = new Logger(SearchService.name);

    constructor(
        private readonly elasticsearchService: ElasticsearchService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        @Inject('REDIS_CLIENT') private readonly redis: Redis,
    ) { }

    async onModuleInit() {
        this.initializeWithRetry();
    }

    private async initializeWithRetry(retries = 10, delay = 5000) {
        for (let i = 0; i < retries; i++) {
            try {
                await this.initializeIndices();
                this.logger.log('Search indices initialized successfully');
                return;
            } catch (error) {
                this.logger.warn(`Elasticsearch initialization attempt ${i + 1} failed. Retrying in ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        this.logger.error('Failed to initialize Elasticsearch indices after multiple retries.');
    }

    private async initializeIndices() {
        const indices = ['jobs', 'users'];
        for (const index of indices) {
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
                            isPromoted: { type: 'boolean' },
                            preferredCommunicationStyle: { type: 'keyword' }
                        }
                    };
                } else if (index === 'users') {
                    body.mappings = {
                        properties: {
                            id: { type: 'keyword' },
                            firstName: { type: 'text' },
                            lastName: { type: 'text' },
                            title: { type: 'text' },
                            overview: { type: 'text' },
                            skills: { type: 'keyword' },
                            communicationStyle: { type: 'keyword' },
                            avgResponseTime: { type: 'float' },
                            reliabilityScore: { type: 'float' },
                            rating: { type: 'float' },
                            isPromoted: { type: 'boolean' }
                        }
                    };
                }
                await this.elasticsearchService.indices.create(body);
                this.logger.log(`Created index: ${index}`);
            }
        }
    }

    async indexJob(job: any) {
        this.logger.log(`Indexing job ${job.id}: ${job.title}`);
        const doc = {
            ...job,
            preferredCommunicationStyle: job.preferredCommunicationStyle || null
        };
        const result = await this.elasticsearchService.index({
            index: 'jobs',
            id: job.id,
            document: doc,
        });
        // Invalidate caches
        await this.invalidateCache(['search:jobs:*', 'search:rec:freelancers:*']);
        return result;
    }

    async indexUser(user: any) {
        this.logger.log(`Indexing user ${user.id}: ${user.email}`);
        const doc = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            title: user.title,
            overview: user.overview,
            skills: user.skills,
            communicationStyle: user.communicationStyle || null,
            avgResponseTime: user.avgResponseTime || null,
            reliabilityScore: user.reliabilityScore || 100,
            rating: user.rating ? parseFloat(user.rating.toString()) : 0,
            isPromoted: user.isPromoted || false
        };
        const result = await this.elasticsearchService.index({
            index: 'users',
            id: user.id,
            document: doc,
        });
        // Invalidate caches
        await this.invalidateCache(['search:users:*', 'search:rec:jobs:*']);
        return result;
    }

    private async invalidateCache(patterns: string[]) {
        try {
            for (const pattern of patterns) {
                const keys = await this.redis.keys(pattern);
                if (keys.length > 0) {
                    await this.redis.del(...keys);
                }
            }
        } catch (err) {
            this.logger.warn(`Failed to invalidate cache for patterns ${patterns.join(',')}: ${err.message}`);
        }
    }

    private generateCacheKey(prefix: string, params: any): string {
        const hash = crypto.createHash('sha256').update(JSON.stringify(params)).digest('hex');
        return `search:${prefix}:${hash}`;
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
        const cacheKey = this.generateCacheKey('jobs', { query, filters });
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            this.logger.log(`Cache HIT for ${cacheKey}`);
            return JSON.parse(cached);
        }
        this.logger.log(`Cache MISS for ${cacheKey}`);

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
                _source: {
                    excludes: ['description'] // Exclude large description field for list view
                },
                query: {
                    bool: { must, filter },
                },
                sort
            });

            const total = typeof result.hits.total === 'number'
                ? result.hits.total
                : (result.hits.total as any).value;

            const response = {
                total,
                page,
                limit,
                results: result.hits.hits.map((hit) => ({
                    ...hit._source as any,
                    matchScore: Math.round((hit._score as number) * 10)
                })),
            };

            await this.redis.set(cacheKey, JSON.stringify(response), 'EX', 60); // Cache for 60 seconds
            return response;

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
        const cacheKey = this.generateCacheKey('users', { query, page, limit });
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            this.logger.log(`Cache HIT for ${cacheKey}`);
            return JSON.parse(cached);
        }
        this.logger.log(`Cache MISS for ${cacheKey}`);

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
                // _source: { excludes: ['overview'] }, // Optional: exclude overview if too large
                query: {
                    bool: { must },
                },
            });

            const total = typeof result.hits.total === 'number'
                ? result.hits.total
                : (result.hits.total as any).value;

            const response = {
                total,
                page,
                limit,
                results: result.hits.hits.map((hit) => ({
                    ...hit._source as any,
                    matchScore: Math.round((hit._score as number) * 10)
                })),
            };

            await this.redis.set(cacheKey, JSON.stringify(response), 'EX', 60);
            return response;
        } catch (error) {
            if ((error as any)?.meta?.body?.error?.type === 'index_not_found_exception') {
                this.logger.warn('Users index not found, returning empty result');
                return { total: 0, page, limit, results: [] };
            }
            throw error;
        }
    }

    async getRecommendedJobs(userId: string, limit: number = 5) {
        const cacheKey = this.generateCacheKey('rec:jobs', { userId, limit });
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            this.logger.log(`Cache HIT for ${cacheKey}`);
            return JSON.parse(cached);
        }
        this.logger.log(`Cache MISS for ${cacheKey}`);

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

            const { skills, primaryCategoryId, experienceLevel, title, communicationStyle } = user;

            // 2. Build recommendations query
            const should: any[] = [];

            if (communicationStyle) {
                should.push({
                    term: { preferredCommunicationStyle: { value: communicationStyle, boost: 2.5 } }
                });
            }

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
                _source: { excludes: ['description'] },
                query,
                sort: [
                    { _score: { order: 'desc' } },
                    { createdAt: { order: 'desc' } }
                ]
            });

            const total = typeof result.hits.total === 'number'
                ? result.hits.total
                : (result.hits.total as any).value;

            const response = {
                total,
                limit,
                results: result.hits.hits.map((hit) => ({
                    ...hit._source as any,
                    matchScore: Math.round((hit._score as number) * 10)
                })),
            };

            await this.redis.set(cacheKey, JSON.stringify(response), 'EX', 600); // 10 minutes cache for recommendations
            return response;
        } catch (error) {
            this.logger.error(`Failed to get recommendations for user ${userId}:`, error.message);
            // Fallback: return recent jobs
            return this.searchJobs('', { limit });
        }
    }

    async getRecommendedFreelancers(jobId: string, limit: number = 10) {
        const cacheKey = this.generateCacheKey('rec:freelancers', { jobId, limit });
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            this.logger.log(`Cache HIT for ${cacheKey}`);
            return JSON.parse(cached);
        }
        this.logger.log(`Cache MISS for ${cacheKey}`);

        try {
            // 1. Fetch job details from job-service
            const jobServiceUrl = this.configService.get<string>('JOB_SERVICE_URL', 'http://job-service:3002');
            const { data: job } = await firstValueFrom(
                this.httpService.get(`${jobServiceUrl}/api/jobs/${jobId}`)
            );

            if (!job) {
                this.logger.warn(`Job ${jobId} not found for recommendations`);
                return { total: 0, results: [] };
            }

            const { skills, categoryId, experienceLevel, preferredCommunicationStyle } = job;

            // 2. Build freelancer recommendations query
            const should: any[] = [];

            // Match skills
            if (skills && skills.length > 0) {
                const skillNames = skills.map((s: any) => s.skill.name);
                should.push({
                    terms: { skills: skillNames, boost: 2.0 }
                });
            }

            // Match category
            if (categoryId) {
                should.push({
                    term: { primaryCategoryId: { value: categoryId, boost: 1.5 } }
                });
            }

            // Match experience level
            if (experienceLevel) {
                should.push({
                    term: { experienceLevel: { value: experienceLevel, boost: 1.0 } }
                });
            }

            // Match Preferred Communication Style (Smart Match feature)
            if (preferredCommunicationStyle) {
                should.push({
                    term: { communicationStyle: { value: preferredCommunicationStyle, boost: 3.0 } }
                });
            }

            // Boost high-reliability freelancers
            should.push({
                range: { reliabilityScore: { gte: 90, boost: 1.2 } }
            });

            // Boost highly rated freelancers
            should.push({
                range: { rating: { gte: 4.5, boost: 1.2 } }
            });

            const result = await this.elasticsearchService.search({
                index: 'users',
                size: limit,
                query: {
                    bool: {
                        must: [{ term: { roles: 'FREELANCER' } }, { term: { status: 'ACTIVE' } }],
                        should,
                        minimum_should_match: 1
                    }
                },
                sort: [
                    { _score: { order: 'desc' } },
                    { rating: { order: 'desc' } }
                ]
            });

            const total = typeof result.hits.total === 'number'
                ? result.hits.total
                : (result.hits.total as any).value;

            const response = {
                total,
                results: result.hits.hits.map((hit) => ({
                    ...hit._source as any,
                    matchScore: Math.round((hit._score as number) * 10) // Mock compatibility percentage
                })),
            };

            await this.redis.set(cacheKey, JSON.stringify(response), 'EX', 600);
            return response;
        } catch (error) {
            this.logger.error(`Failed to get recommendations for job ${jobId}: ${error.message}`);
            if (error.response) {
                this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
            }
            return { total: 0, results: [] };
        }
    }
}
