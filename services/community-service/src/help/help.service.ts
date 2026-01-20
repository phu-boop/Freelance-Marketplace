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

    async semanticSearch(userId: string, query: string) {
        // In a real app, use Gemini/OpenAI to find relevant articles
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
            // Auto-create a ticket if no articles found and user is logged in
            if (userId && query.length > 10) {
                const ticket = await this.createTicket(userId, {
                    subject: `Auto-generated from search: ${query.slice(0, 30)}...`,
                    description: `User was looking for: "${query}". No relevant articles found.`,
                    priority: 'NORMAL',
                });
                return {
                    message: "I couldn't find a direct answer, so I've automatically opened a support ticket for you.",
                    ticket,
                    suggestTickets: true,
                };
            }
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
