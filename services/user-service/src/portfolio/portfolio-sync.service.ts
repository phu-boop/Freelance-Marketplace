import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PortfolioSyncService {
  private logger = new Logger('PortfolioSyncService');

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async syncGitHub(userId: string, username: string) {
    this.logger.log(
      `Syncing GitHub repositories for user ${userId}, username: ${username}`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://api.github.com/users/${username}/repos`, {
          params: {
            sort: 'updated',
            per_page: 10,
          },
        }),
      );

      const repos = response.data;

      // Delete existing GitHub portfolio items
      await this.prisma.portfolioItem.deleteMany({
        where: { userId, source: 'GITHUB' },
      });

      // Create new portfolio items from repos
      const portfolioItems = repos.map((repo: any) => ({
        userId,
        title: repo.name,
        description: repo.description || 'No description provided',
        imageUrl: `https://opengraph.githubassets.com/1/${username}/${repo.name}`,
        projectUrl: repo.html_url,
        skills: repo.language ? [repo.language] : [],
        completionDate: new Date(repo.updated_at),
        source: 'GITHUB',
        externalId: repo.id.toString(),
        externalUrl: repo.html_url,
      }));

      await this.prisma.portfolioItem.createMany({
        data: portfolioItems,
      });

      // Update user sync timestamp
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          githubUsername: username,
          lastPortfolioSync: new Date(),
        },
      });

      this.logger.log(
        `Synced ${portfolioItems.length} GitHub repositories for user ${userId}`,
      );
      return { success: true, count: portfolioItems.length };
    } catch (error) {
      this.logger.error(
        `Failed to sync GitHub for user ${userId}: ${error.message}`,
      );
      throw new Error(`GitHub sync failed: ${error.message}`);
    }
  }

  async syncBehance(userId: string, username: string) {
    this.logger.log(
      `Syncing Behance projects for user ${userId}, username: ${username}`,
    );

    const apiKey = this.configService.get<string>('BEHANCE_API_KEY');
    if (!apiKey) {
      this.logger.warn('Behance API key not configured, skipping sync');
      return { success: false, message: 'Behance API key not configured' };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.behance.net/v2/users/${username}/projects`,
          {
            params: {
              api_key: apiKey,
              per_page: 10,
            },
          },
        ),
      );

      const projects = response.data.projects || [];

      // Delete existing Behance portfolio items
      await this.prisma.portfolioItem.deleteMany({
        where: { userId, source: 'BEHANCE' },
      });

      // Create new portfolio items from projects
      const portfolioItems = projects.map((project: any) => ({
        userId,
        title: project.name,
        description: project.description || 'No description provided',
        imageUrl: project.covers?.['404'] || project.covers?.original || '',
        projectUrl: project.url,
        skills: project.fields || [],
        completionDate: new Date(project.published_on * 1000),
        source: 'BEHANCE',
        externalId: project.id.toString(),
        externalUrl: project.url,
      }));

      await this.prisma.portfolioItem.createMany({
        data: portfolioItems,
      });

      // Update user sync timestamp
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          behanceUsername: username,
          lastPortfolioSync: new Date(),
        },
      });

      this.logger.log(
        `Synced ${portfolioItems.length} Behance projects for user ${userId}`,
      );
      return { success: true, count: portfolioItems.length };
    } catch (error) {
      this.logger.error(
        `Failed to sync Behance for user ${userId}: ${error.message}`,
      );
      throw new Error(`Behance sync failed: ${error.message}`);
    }
  }

  async syncDribbble(userId: string, username: string) {
    this.logger.log(
      `Syncing Dribbble shots for user ${userId}, username: ${username}`,
    );

    const accessToken = this.configService.get<string>('DRIBBBLE_ACCESS_TOKEN');
    if (!accessToken) {
      this.logger.warn('Dribbble access token not configured, skipping sync');
      return {
        success: false,
        message: 'Dribbble access token not configured',
      };
    }

    try {
      // First, get user ID from username
      const userResponse = await firstValueFrom(
        this.httpService.get(`https://api.dribbble.com/v2/user`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );

      const shotsResponse = await firstValueFrom(
        this.httpService.get(`https://api.dribbble.com/v2/user/shots`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            per_page: 10,
          },
        }),
      );

      const shots = shotsResponse.data || [];

      // Delete existing Dribbble portfolio items
      await this.prisma.portfolioItem.deleteMany({
        where: { userId, source: 'DRIBBBLE' },
      });

      // Create new portfolio items from shots
      const portfolioItems = shots.map((shot: any) => ({
        userId,
        title: shot.title,
        description: shot.description || 'No description provided',
        imageUrl: shot.images?.hidpi || shot.images?.normal || '',
        projectUrl: shot.html_url,
        skills: shot.tags || [],
        completionDate: new Date(shot.published_at),
        source: 'DRIBBBLE',
        externalId: shot.id.toString(),
        externalUrl: shot.html_url,
      }));

      await this.prisma.portfolioItem.createMany({
        data: portfolioItems,
      });

      // Update user sync timestamp
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          dribbbleUsername: username,
          lastPortfolioSync: new Date(),
        },
      });

      this.logger.log(
        `Synced ${portfolioItems.length} Dribbble shots for user ${userId}`,
      );
      return { success: true, count: portfolioItems.length };
    } catch (error) {
      this.logger.error(
        `Failed to sync Dribbble for user ${userId}: ${error.message}`,
      );
      throw new Error(`Dribbble sync failed: ${error.message}`);
    }
  }

  async syncAllPlatforms(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        githubUsername: true,
        behanceUsername: true,
        dribbbleUsername: true,
      },
    });

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const results: any = {
      github: null,
      behance: null,
      dribbble: null,
    };

    if (user.githubUsername) {
      try {
        results.github = await this.syncGitHub(userId, user.githubUsername);
      } catch (error) {
        this.logger.error(`GitHub sync failed: ${error.message}`);
      }
    }

    if (user.behanceUsername) {
      try {
        results.behance = await this.syncBehance(userId, user.behanceUsername);
      } catch (error) {
        this.logger.error(`Behance sync failed: ${error.message}`);
      }
    }

    if (user.dribbbleUsername) {
      try {
        results.dribbble = await this.syncDribbble(
          userId,
          user.dribbbleUsername,
        );
      } catch (error) {
        this.logger.error(`Dribbble sync failed: ${error.message}`);
      }
    }

    return results;
  }
}
