import { Controller, Get, Post, Request } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { Roles } from 'nest-keycloak-connect';

@Controller('api/referrals')
export class ReferralsController {
    constructor(private readonly referralsService: ReferralsService) { }

    @Post('generate')
    @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'] })
    generateCode(@Request() req) {
        return this.referralsService.generateReferralCode(req.user.sub);
    }

    @Get('stats')
    @Roles({ roles: ['realm:CLIENT', 'CLIENT', 'realm:FREELANCER', 'FREELANCER'] })
    getStats(@Request() req) {
        return this.referralsService.getStats(req.user.sub);
    }
}
