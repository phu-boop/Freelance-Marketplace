import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Post('jobs/index')
    async indexJob(@Body() job: any) {
        return this.searchService.indexJob(job);
    }

    @Post('users/index')
    async indexUser(@Body() user: any) {
        return this.searchService.indexUser(user);
    }

    @Get('jobs')
    async searchJobs(
        @Query('q') query: string,
        @Query('types') types?: string,
        @Query('levels') levels?: string,
        @Query('minSalary') minSalary?: string,
        @Query('maxSalary') maxSalary?: string,
        @Query('location') location?: string,
        @Query('categoryId') categoryId?: string,
        @Query('skills') skills?: string,
        @Query('sortBy') sortBy?: string,
        @Query('sortOrder') sortOrder?: 'asc' | 'desc',
        @Query('postedWithin') postedWithin?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        return this.searchService.searchJobs(query, {
            types,
            levels,
            minSalary,
            maxSalary,
            location,
            categoryId,
            skills,
            sortBy,
            sortOrder,
            postedWithin,
            page,
            limit
        });
    }

    @Get('users')
    async searchUsers(
        @Query('q') query: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ) {
        return this.searchService.searchUsers(query, page, limit);
    }

    @Get('jobs/recommendations')
    async getRecommendations(
        @Query('userId') userId: string,
        @Query('limit') limit: number = 5,
    ) {
        return this.searchService.getRecommendedJobs(userId, Number(limit));
    }
}
