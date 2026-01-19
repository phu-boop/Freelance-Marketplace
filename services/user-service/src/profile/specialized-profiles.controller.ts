import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Request,
} from '@nestjs/common';
import { Roles } from 'nest-keycloak-connect';
import { SpecializedProfilesService } from './specialized-profiles.service';
import { CreateSpecializedProfileDto } from './dto/create-specialized-profile.dto';

@Controller('api/profiles/specialized')
export class SpecializedProfilesController {
    constructor(private readonly specializedProfilesService: SpecializedProfilesService) { }

    @Post()
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
    create(@Request() req, @Body() dto: CreateSpecializedProfileDto) {
        return this.specializedProfilesService.create(req.user.sub, dto);
    }

    @Get()
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
    findAll(@Request() req) {
        return this.specializedProfilesService.findAll(req.user.sub);
    }

    @Get(':id')
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
    findOne(@Request() req, @Param('id') id: string) {
        return this.specializedProfilesService.findOne(req.user.sub, id);
    }

    @Patch(':id')
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
    update(@Request() req, @Param('id') id: string, @Body() dto: Partial<CreateSpecializedProfileDto>) {
        return this.specializedProfilesService.update(req.user.sub, id, dto);
    }

    @Delete(':id')
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
    remove(@Request() req, @Param('id') id: string) {
        return this.specializedProfilesService.remove(req.user.sub, id);
    }

    @Post(':id/link-portfolio/:portfolioItemId')
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
    linkPortfolio(
        @Request() req,
        @Param('id') id: string,
        @Param('portfolioItemId') portfolioItemId: string,
    ) {
        return this.specializedProfilesService.linkPortfolioItem(req.user.sub, id, portfolioItemId);
    }

    @Post(':id/link-experience/:experienceId')
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
    linkExperience(
        @Request() req,
        @Param('id') id: string,
        @Param('experienceId') experienceId: string,
    ) {
        return this.specializedProfilesService.linkExperience(req.user.sub, id, experienceId);
    }

    @Post(':id/link-education/:educationId')
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
    linkEducation(
        @Request() req,
        @Param('id') id: string,
        @Param('educationId') educationId: string,
    ) {
        return this.specializedProfilesService.linkEducation(req.user.sub, id, educationId);
    }

    @Post(':id/link-certification/:certificationId')
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
    linkCertification(
        @Request() req,
        @Param('id') id: string,
        @Param('certificationId') certificationId: string,
    ) {
        return this.specializedProfilesService.linkCertification(req.user.sub, id, certificationId);
    }

    @Post('unlink/:type/:itemId')
    @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
    unlink(
        @Request() req,
        @Param('type') type: 'portfolio' | 'experience' | 'education' | 'certification',
        @Param('itemId') itemId: string,
    ) {
        return this.specializedProfilesService.unlinkItem(req.user.sub, type, itemId);
    }
}
