import { Controller, Post, Get, Body, Query, Param, ForbiddenException, Header, Headers } from '@nestjs/common';
import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { Public, Roles } from 'nest-keycloak-connect';

@Controller('api/audit')
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @Public()
    @Post('logs')
    create(
        @Body() createAuditLogDto: CreateAuditLogDto,
        @Headers('x-audit-secret') secret?: string
    ) {
        const internalSecret = process.env.AUDIT_SECRET || 'fallback-secret';
        if (secret !== internalSecret) {
            throw new ForbiddenException('Invalid audit secret');
        }
        return this.auditService.create(createAuditLogDto);
    }

    @Roles({ roles: ['realm:ADMIN'] })
    @Get('logs')
    findAll(@Query('limit') limit?: number, @Query('offset') offset?: number) {
        return this.auditService.findAll(limit, offset);
    }

    @Roles({ roles: ['realm:ADMIN'] })
    @Get('logs/:id/verify')
    verify(@Param('id') id: string) {
        return this.auditService.verifyLog(id);
    }

    @Roles({ roles: ['realm:ADMIN'] })
    @Post('verify-all')
    verifyAll() {
        return this.auditService.verifyAll();
    }
}
