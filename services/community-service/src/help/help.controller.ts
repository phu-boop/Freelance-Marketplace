import { Controller, Get, Post, Body, Param, Query, Request } from '@nestjs/common';
import { HelpService } from './help.service';
import { CreateHelpArticleDto, CreateSupportTicketDto, SearchHelpDto } from './help.dto';
import { Public, Roles } from 'nest-keycloak-connect';

@Controller('help')
export class HelpController {
    constructor(private readonly helpService: HelpService) { }

    @Post('articles')
    @Roles({ roles: ['realm:ADMIN', 'ADMIN'] })
    createArticle(@Body() dto: CreateHelpArticleDto) {
        return this.helpService.createArticle(dto);
    }

    @Public()
    @Get('articles')
    getArticles(@Query('category') category?: string) {
        return this.helpService.getArticles(category);
    }

    @Public()
    @Get('articles/:slug')
    getArticle(@Param('slug') slug: string) {
        return this.helpService.getArticleBySlug(slug);
    }

    @Public()
    @Post('search')
    search(@Request() req, @Body() dto: SearchHelpDto) {
        const userId = req.user?.sub;
        return this.helpService.semanticSearch(userId, dto.query);
    }

    @Post('tickets')
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] })
    createTicket(@Request() req, @Body() dto: CreateSupportTicketDto) {
        return this.helpService.createTicket(req.user.sub, dto);
    }

    @Get('tickets/my')
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER', 'realm:CLIENT', 'CLIENT'] })
    getMyTickets(@Request() req) {
        return this.helpService.getMyTickets(req.user.sub);
    }
}
