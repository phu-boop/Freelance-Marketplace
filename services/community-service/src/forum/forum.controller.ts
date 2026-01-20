import { Controller, Get, Post, Body, Param, Query, Request } from '@nestjs/common';
import { ForumService } from './forum.service';
import { CreatePostDto, CreateCommentDto } from './forum.dto';
import { Public, Roles } from 'nest-keycloak-connect';

@Controller('forum')
export class ForumController {
    constructor(private readonly forumService: ForumService) { }

    @Public()
    @Get('categories')
    getCategories() {
        return this.forumService.getCategories();
    }

    @Public()
    @Get('posts')
    getPosts(
        @Query('categoryId') categoryId?: string,
        @Query('tag') tag?: string,
        @Query('q') query?: string,
    ) {
        return this.forumService.getPosts(categoryId, tag, query);
    }

    @Public()
    @Get('posts/:id')
    getPost(@Param('id') id: string) {
        return this.forumService.getPost(id);
    }

    @Post('posts')
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] })
    createPost(@Request() req, @Body() dto: CreatePostDto) {
        return this.forumService.createPost(req.user.sub, dto);
    }

    @Post('posts/:id/comments')
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] })
    createComment(@Request() req, @Param('id') id: string, @Body() dto: CreateCommentDto) {
        return this.forumService.createComment(req.user.sub, id, dto);
    }

    @Post('posts/:id/vote')
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] })
    votePost(@Request() req, @Param('id') id: string, @Body('value') value: number) {
        return this.forumService.vote(req.user.sub, id, 'POST', value);
    }

    @Post('comments/:id/vote')
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] })
    voteComment(@Request() req, @Param('id') id: string, @Body('value') value: number) {
        return this.forumService.vote(req.user.sub, id, 'COMMENT', value);
    }
}
