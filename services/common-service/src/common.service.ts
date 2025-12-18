import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CommonService extends PrismaClient implements OnModuleInit {
    async onModuleInit() {
        await this.$connect();
    }

    async getCategories() {
        return this.category.findMany();
    }

    async createCategory(data: { name: string; slug: string; description?: string }) {
        return this.category.create({ data });
    }

    async getSkills() {
        return this.skill.findMany();
    }

    async createSkill(data: { name: string; slug: string }) {
        return this.skill.create({ data });
    }
}
