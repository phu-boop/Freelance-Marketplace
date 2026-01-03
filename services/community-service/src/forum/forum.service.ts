import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, CreateCommentDto } from './forum.dto';

@Injectable()
export class ForumService {
    constructor(private prisma: PrismaService) { }

    // Categories
    async getCategories() {
        return this.prisma.forumCategory.findMany({
            include: { _count: { select: { posts: true } } }
        });
    }

    // Posts
    async createPost(userId: string, dto: CreatePostDto) {
        return this.prisma.forumPost.create({
            data: {
                ...dto,
                authorId: userId,
            }
        });
    }

    async getPosts(categoryId?: string, tag?: string, query?: string) {
        const where: any = {};
        if (categoryId) where.categoryId = categoryId;
        if (tag) where.tags = { has: tag };
        if (query) {
            where.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { content: { contains: query, mode: 'insensitive' } },
            ];
        }

        return this.prisma.forumPost.findMany({
            where,
            include: {
                category: true,
                _count: { select: { comments: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getPost(id: string) {
        const post = await this.prisma.forumPost.findUnique({
            where: { id },
            include: {
                category: true,
                comments: {
                    where: { parentId: null },
                    include: {
                        replies: { include: { replies: true } }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!post) throw new NotFoundException('Post not found');

        // Increment view count
        await this.prisma.forumPost.update({
            where: { id },
            data: { viewCount: { increment: 1 } }
        });

        return post;
    }

    // Comments
    async createComment(userId: string, postId: string, dto: CreateCommentDto) {
        const post = await this.prisma.forumPost.findUnique({ where: { id: postId } });
        if (!post) throw new NotFoundException('Post not found');

        return this.prisma.forumComment.create({
            data: {
                ...dto,
                authorId: userId,
                postId,
            }
        });
    }

    // Voting
    async vote(userId: string, targetId: string, type: 'POST' | 'COMMENT', value: number) {
        const voteData = {
            userId,
            [type === 'POST' ? 'postId' : 'commentId']: targetId,
        };

        const existingVote = await this.prisma.forumVote.findUnique({
            where: type === 'POST' ? { userId_postId: voteData as any } : { userId_commentId: voteData as any }
        });

        if (existingVote) {
            if (existingVote.value === value) {
                // Remove vote if same value (toggle)
                await this.prisma.forumVote.delete({ where: { id: existingVote.id } });
            } else {
                // Change vote
                await this.prisma.forumVote.update({
                    where: { id: existingVote.id },
                    data: { value }
                });
            }
        } else {
            await this.prisma.forumVote.create({
                data: { ...voteData, value }
            });
        }

        // Recalculate upvotes/downvotes
        if (type === 'POST') {
            await this.updatePostVoteCounts(targetId);
        } else {
            await this.updateCommentVoteCounts(targetId);
        }
    }

    private async updatePostVoteCounts(postId: string) {
        const votes = await this.prisma.forumVote.findMany({ where: { postId } });
        const upvotes = votes.filter(v => v.value === 1).length;
        const downvotes = votes.filter(v => v.value === -1).length;
        await this.prisma.forumPost.update({
            where: { id: postId },
            data: { upvotes, downvotes }
        });
    }

    private async updateCommentVoteCounts(commentId: string) {
        const votes = await this.prisma.forumVote.findMany({ where: { commentId } });
        const upvotes = votes.filter(v => v.value === 1).length;
        const downvotes = votes.filter(v => v.value === -1).length;
        await this.prisma.forumComment.update({
            where: { id: commentId },
            data: { upvotes, downvotes }
        });
    }
}
