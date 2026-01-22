import { Controller, Get, Post, Body, Param, ForbiddenException, Request } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { Public, Roles, AuthenticatedUser } from 'nest-keycloak-connect';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Controller('api/agencies')
export class AgenciesController {
    constructor(
        private readonly teamsService: TeamsService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { }

    @Get(':id/metrics')
    async getMetrics(@Param('id') id: string, @AuthenticatedUser() user: any) {
        const userId = user.sub;
        const team = await this.teamsService.findOne(id);
        if (!team.isAgency) {
            throw new ForbiddenException('Team is not an agency');
        }

        const member = team.members.find(m => m.userId === userId);
        if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
            throw new ForbiddenException('Access denied to agency metrics');
        }

        // Fetch revenue from payment-service
        const paymentServiceUrl = this.configService.get('PAYMENT_SERVICE_URL', 'http://payment-service:3005');
        let totalRevenue = 0;
        try {
            const revenueRes = await firstValueFrom(
                this.httpService.get(`${paymentServiceUrl}/api/payments/agency/${id}/revenue`)
            );
            totalRevenue = revenueRes.data.total;
        } catch (error) {
            console.error('Failed to fetch agency revenue', error.message);
        }

        // Fetch active contracts from contract-service
        const contractServiceUrl = this.configService.get('CONTRACT_SERVICE_URL', 'http://contract-service:3004');
        let activeContractsCount = 0;
        try {
            const contractsRes = await firstValueFrom(
                this.httpService.get(`${contractServiceUrl}/api/contracts/agency/${id}/active-count`)
            );
            activeContractsCount = contractsRes.data.count;
        } catch (error) {
            console.error('Failed to fetch agency contracts count', error.message);
        }

        return {
            totalRevenue,
            activeContractsCount,
            memberCount: team.members.length,
            revenueSplitPercent: team.revenueSplitPercent
        };
    }

    @Post(':id/settings')
    async updateSettings(
        @Param('id') id: string,
        @AuthenticatedUser() user: any,
        @Body() settings: { revenueSplitPercent?: number }
    ) {
        const userId = user.sub;
        const team = await this.teamsService.findOne(id);
        if (!team.isAgency) {
            throw new ForbiddenException('Team is not an agency');
        }

        if (team.ownerId !== userId) {
            throw new ForbiddenException('Only owner can update agency settings');
        }

        return this.teamsService.update(id, userId, {
            revenueSplitPercent: settings.revenueSplitPercent
        } as any);
    }
}
