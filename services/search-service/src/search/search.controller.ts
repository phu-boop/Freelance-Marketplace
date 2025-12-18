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
    async searchJobs(@Query('q') query: string) {
        return this.searchService.searchJobs(query);
    }

    @Get('users')
    async searchUsers(@Query('q') query: string) {
        return this.searchService.searchUsers(query);
    }
}
