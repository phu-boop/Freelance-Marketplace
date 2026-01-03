import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateServicePackageDto } from './dto/create-service-package.dto';
import { Public, Roles } from 'nest-keycloak-connect';

@Controller('api/service-packages')
export class ServicePackagesController {
    constructor(private readonly jobsService: JobsService) { }

    @Post()
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
    create(@Body() dto: CreateServicePackageDto, @Request() req) {
        const userId = req.user.sub;
        return this.jobsService.createServicePackage(userId, dto);
    }

    @Public()
    @Get()
    findAll(@Query('freelancerId') freelancerId?: string) {
        return this.jobsService.findServicePackages(freelancerId);
    }

    @Public()
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.jobsService.findOneServicePackage(id);
    }

    @Patch(':id')
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
    update(@Param('id') id: string, @Body() dto: any, @Request() req) {
        const userId = req.user.sub;
        return this.jobsService.updateServicePackage(id, userId, dto);
    }

    @Delete(':id')
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
    remove(@Param('id') id: string, @Request() req) {
        const userId = req.user.sub;
        return this.jobsService.deleteServicePackage(id, userId);
    }
}
