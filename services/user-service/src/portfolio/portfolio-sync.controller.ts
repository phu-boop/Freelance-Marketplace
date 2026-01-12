import { Controller, Post, Delete, Param, Body, Request } from '@nestjs/common';
import { PortfolioSyncService } from './portfolio-sync.service';
import { Roles } from 'nest-keycloak-connect';

@Controller('api/users/:userId/portfolio')
export class PortfolioSyncController {
  constructor(private readonly portfolioSyncService: PortfolioSyncService) {}

  @Post('connect-github')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
  async connectGitHub(
    @Param('userId') userId: string,
    @Body() body: { username: string },
    @Request() req,
  ) {
    // Verify user can only connect their own account
    if (req.user.sub !== userId) {
      throw new Error('Unauthorized');
    }

    return this.portfolioSyncService.syncGitHub(userId, body.username);
  }

  @Post('connect-behance')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
  async connectBehance(
    @Param('userId') userId: string,
    @Body() body: { username: string },
    @Request() req,
  ) {
    if (req.user.sub !== userId) {
      throw new Error('Unauthorized');
    }

    return this.portfolioSyncService.syncBehance(userId, body.username);
  }

  @Post('connect-dribbble')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
  async connectDribbble(
    @Param('userId') userId: string,
    @Body() body: { username: string },
    @Request() req,
  ) {
    if (req.user.sub !== userId) {
      throw new Error('Unauthorized');
    }

    return this.portfolioSyncService.syncDribbble(userId, body.username);
  }

  @Post('sync')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
  async syncAll(@Param('userId') userId: string, @Request() req) {
    if (req.user.sub !== userId) {
      throw new Error('Unauthorized');
    }

    return this.portfolioSyncService.syncAllPlatforms(userId);
  }

  @Delete('disconnect/:platform')
  @Roles({ roles: ['realm:FREELANCER', 'FREELANCER'] })
  async disconnect(
    @Param('userId') userId: string,
    @Param('platform') platform: string,
    @Request() req,
  ) {
    if (req.user.sub !== userId) {
      throw new Error('Unauthorized');
    }

    // Implementation for disconnecting platform
    // This would remove the username and delete synced items
    return { message: `Disconnected from ${platform}` };
  }
}
