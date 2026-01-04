// src/profile/profile.controller.ts
import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDraftDto } from './dto/create-profile-draft.dto';

@Controller('api/users/profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Post('draft')
    async upsertDraft(@Request() req, @Body() dto: CreateProfileDraftDto) {
        const userId = req.user.sub; // assuming Keycloak JWT contains sub
        return this.profileService.upsertDraft(userId, dto);
    }

    @Get('draft/:userId')
    async getDraft(@Param('userId') userId: string) {
        return this.profileService.getDraft(userId);
    }

    @Post('complete')
    async completeProfile(@Request() req) {
        const userId = req.user.sub;
        return this.profileService.completeProfile(userId);
    }
}
