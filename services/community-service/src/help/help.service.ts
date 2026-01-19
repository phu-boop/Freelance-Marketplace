import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHelpArticleDto, CreateSupportTicketDto } from './help.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class HelpService {
    constructor(
        private prisma: PrismaService,
        private httpService: HttpService,
        private configService: ConfigService,
    ) { }

    async createArticle(dto: CreateHelpArticleDto) {
        return this.prisma.helpArticle.create({ data: dto });
    }

    async getArticles(category?: string) {
        return this.prisma.helpArticle.findMany({
            where: category ? { category, isPublic: true } : { isPublic: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getArticleBySlug(slug: string) {
        const article = await this.prisma.helpArticle.findUnique({ where: { slug } });
        if (!article) throw new NotFoundException('Article not found');
        return article;
    }

    async semanticSearch(query: string) {
        // In a real app, use Gemini/OpenAI to find relevant articles
        // For this phase, we do a keyword and content search
        const articles = await this.prisma.helpArticle.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { content: { contains: query, mode: 'insensitive' } },
                    { keywords: { has: query } },
                ],
                isPublic: true,
            },
        });

        if (articles.length === 0) {
            return {
                message: "I couldn't find a direct answer. Would you like to open a support ticket?",
                suggestTickets: true,
            };
        }

        return articles;
    }

    async createTicket(userId: string, dto: CreateSupportTicketDto) {
        return this.prisma.supportTicket.create({
            data: {
                ...dto,
                userId,
                status: 'OPEN',
            },
        });
    }

    async getMyTickets(userId: string) {
        return this.prisma.supportTicket.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
}
