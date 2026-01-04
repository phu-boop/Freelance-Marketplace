import { Controller, Get, Post, Body } from '@nestjs/common';
import { CommonService } from './common.service';

@Controller('api/common')
export class CommonController {
    constructor(private readonly commonService: CommonService) { }

    @Get('categories')
    async getCategories() {
        return this.commonService.getCategories();
    }

    @Post('categories')
    async createCategory(@Body() body: { name: string; slug: string; description?: string }) {
        return this.commonService.createCategory(body);
    }

    @Get('skills')
    async getSkills() {
        return this.commonService.getSkills();
    }

    @Post('skills')
    async createSkill(@Body() body: { name: string; slug: string }) {
        return this.commonService.createSkill(body);
    }
}
