import { Controller, Post, Get, Body, Query, Param } from '@nestjs/common';
import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Controller('api/audit')
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @Post('logs')
    create(@Body() createAuditLogDto: CreateAuditLogDto) {
        return this.auditService.create(createAuditLogDto);
    }

    @Get('logs')
    findAll(@Query('limit') limit?: number, @Query('offset') offset?: number) {
        return this.auditService.findAll(limit, offset);
    }

    @Get('logs/:id/verify')
    verify(@Param('id') id: string) {
        return this.auditService.verifyLog(id);
    }
}
