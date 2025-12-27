import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { CreateJobAlertDto } from './dto/create-job-alert.dto';
import { CreateCategoryDto } from '../categories/create-category.dto';
import { PrismaService } from '../prisma/prisma.service';

import { HttpService } from '@nestjs/axios';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService
  ) { }

  async create(createJobDto: CreateJobDto) {
    const { skillIds, skills, ...jobData } = createJobDto;

    // Handle skill names if provided
    let finalSkillIds = skillIds || [];
    if (skills && skills.length > 0) {
      const skillInstances = await Promise.all(
        skills.map(async (name) => {
          const slug = name.toLowerCase().replace(/ /g, '-');
          return this.prisma.skill.upsert({
            where: { name },
            update: {},
            create: { name },
          });
        }),
      );
      finalSkillIds = [...new Set([...finalSkillIds, ...skillInstances.map(s => s.id)])];
    }

    const job = await this.prisma.job.create({
      data: {
        ...jobData,
        skills: {
          create: finalSkillIds.map(skillId => ({
            skill: { connect: { id: skillId } }
          }))
        }
      },
      include: {
        category: true,
        skills: {
          include: {
            skill: true
          }
        }
      }
    });

    // Sync to search service
    await this.syncToSearch(job);

    return job;
  }

  private async syncToSearch(job: any) {
    try {
      const searchUrl = process.env.SEARCH_SERVICE_URL || 'http://search-service:3010';
      console.log(`Syncing job ${job.id} to ${searchUrl}/search/jobs/index`);
      const indexedJob = {
        id: job.id,
        title: job.title,
        description: job.description,
        budget: job.budget,
        location: job.location,
        type: job.type,
        experienceLevel: job.experienceLevel,
        category: job.category?.name,
        categoryId: job.categoryId,
        skills: job.skills?.map((s: any) => s.skill.name) || [],
        createdAt: job.createdAt,
        status: job.status
      };

      const response = await fetch(`${searchUrl}/search/jobs/index`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(indexedJob),
      });

      if (!response.ok) {
        console.error(`Search sync failed with status ${response.status}: ${await response.text()}`);
      } else {
        console.log(`Successfully synced job ${job.id} to search service`);
      }
    } catch (error) {
      console.error('Failed to sync job to search service:', error);
    }
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [total, results] = await Promise.all([
      this.prisma.job.count(),
      this.prisma.job.findMany({
        skip,
        take: limit,
        include: {
          category: true,
          skills: {
            include: {
              skill: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    return {
      total,
      page,
      limit,
      results
    };
  }

  findByClient(clientId: string) {
    return this.prisma.job.findMany({
      where: { client_id: clientId },
      include: {
        category: true,
        skills: {
          include: {
            skill: true
          }
        }
      }
    });
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        category: true,
        skills: {
          include: {
            skill: true
          }
        }
      }
    });

    if (!job) return null;

    try {
      const userServiceUrl = process.env.USER_SERVICE_INTERNAL_URL || 'http://user-service:3000';
      const userResponse = await fetch(`${userServiceUrl}/${job.client_id}`);
      if (userResponse.ok) {
        const client = await userResponse.json();
        return {
          ...job,
          client: {
            id: client.id,
            firstName: client.firstName,
            lastName: client.lastName,
            companyName: client.companyName,
            companyLogo: client.companyLogo,
            rating: client.rating,
            reviewCount: client.reviewCount,
            isPaymentVerified: client.isPaymentVerified
          }
        };
      }
    } catch (error) {
      console.error(`Failed to fetch client info for job ${id}:`, error);
    }

    return job;
  }

  async update(id: string, updateJobDto: UpdateJobDto) {
    const { skillIds, ...jobData } = updateJobDto as any;

    // If skillIds are provided, we need to reset them
    if (skillIds) {
      await this.prisma.jobSkill.deleteMany({ where: { jobId: id } });
    }

    const job = await this.prisma.job.update({
      where: { id },
      data: {
        ...jobData,
        ...(skillIds && {
          skills: {
            create: skillIds.map(skillId => ({
              skill: { connect: { id: skillId } }
            }))
          }
        })
      },
      include: {
        category: true,
        skills: {
          include: {
            skill: true
          }
        }
      }
    });

    await this.syncToSearch(job);
    return job;
  }

  remove(id: string) {
    return this.prisma.job.delete({
      where: { id },
    });
  }

  // Admin Actions
  async approveJob(id: string) {
    const job = await this.prisma.job.update({
      where: { id },
      data: { status: 'OPEN' },
      include: { category: true, skills: { include: { skill: true } } }
    });
    await this.syncToSearch(job);
    await this.processJobAlerts(job);
    return job;
  }

  async rejectJob(id: string) {
    const job = await this.prisma.job.update({
      where: { id: id },
      data: { status: 'REJECTED' },
      include: { category: true, skills: { include: { skill: true } } }
    });
    await this.syncToSearch(job);
    return job;
  }

  async closeJob(id: string) {
    const job = await this.prisma.job.update({
      where: { id: id },
      data: { status: 'CLOSED' },
      include: { category: true, skills: { include: { skill: true } } }
    });
    await this.syncToSearch(job);
    return job;
  }

  lockJob(id: string) {
    return this.prisma.job.update({
      where: { id },
      data: { status: 'LOCKED' }
    });
  }

  unlockJob(id: string) {
    return this.prisma.job.update({
      where: { id },
      data: { status: 'OPEN' }
    });
  }

  async duplicateJob(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { skills: true }
    });
    if (!job) throw new Error('Job not found');

    const { id: _, createdAt: __, updatedAt: ___, status: ____, ...jobData } = job;

    return this.prisma.job.create({
      data: {
        ...jobData,
        title: `${job.title} (Copy)`,
        status: 'PENDING',
        skills: {
          create: job.skills.map(s => ({
            skill: { connect: { id: s.skillId } }
          }))
        }
      },
      include: {
        category: true,
        skills: {
          include: {
            skill: true
          }
        }
      }
    });
  }

  // Taxonomy - Categories
  createCategory(createCategoryDto: CreateCategoryDto) {
    const { name, parentId } = createCategoryDto;
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    return this.prisma.category.create({
      data: {
        name,
        slug,
        parentId: parentId || null
      }
    });
  }

  findAllCategories() {
    return this.prisma.category.findMany({
      include: {
        children: true
      }
    });
  }

  // Taxonomy - Skills
  createSkill(name: string) {
    return this.prisma.skill.create({ data: { name } });
  }

  findAllSkills() {
    return this.prisma.skill.findMany();
  }

  // Saved Jobs
  async saveJob(userId: string, jobId: string) {
    return this.prisma.savedJob.upsert({
      where: {
        userId_jobId: {
          userId,
          jobId
        }
      },
      update: {},
      create: {
        userId,
        jobId
      }
    });
  }

  async unsaveJob(userId: string, jobId: string) {
    return this.prisma.savedJob.delete({
      where: {
        userId_jobId: {
          userId,
          jobId
        }
      }
    });
  }

  async getSavedJobs(userId: string) {
    const savedJobs = await this.prisma.savedJob.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            category: true,
            skills: {
              include: {
                skill: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return savedJobs.map(sj => sj.job);
  }

  // Alerts
  async createAlert(userId: string, dto: CreateJobAlertDto) {
    return this.prisma.jobAlert.create({
      data: {
        userId,
        keyword: dto.keyword,
        categoryId: dto.categoryId,
        minBudget: dto.minBudget,
        maxBudget: dto.maxBudget,
        experienceLevel: dto.experienceLevel,
        locationType: dto.locationType
      }
    });
  }

  async findAlertsByUser(userId: string) {
    return this.prisma.jobAlert.findMany({
      where: { userId }
    });
  }

  async removeAlert(userId: string, id: string) {
    return this.prisma.jobAlert.delete({
      where: { id, userId }
    });
  }

  private async processJobAlerts(job: any) {
    try {
      console.log(`Processing alerts for job ${job.id}`);
      const alerts = await this.prisma.jobAlert.findMany({
        where: {
          OR: [
            { categoryId: job.categoryId },
            { experienceLevel: job.experienceLevel },
            { locationType: job.locationType },
            job.title ? { keyword: { contains: job.title, mode: 'insensitive' } } : {},
            job.description ? { keyword: { contains: job.description, mode: 'insensitive' } } : {}
          ]
        }
      });

      if (alerts.length === 0) {
        console.log(`No matching alerts for job ${job.id}`);
        return;
      }

      console.log(`Found ${alerts.length} matching alerts for job ${job.id}`);
      const userServiceUrl = process.env.USER_SERVICE_INTERNAL_URL || 'http://user-service:3000';
      const emailServiceUrl = process.env.EMAIL_SERVICE_INTERNAL_URL || 'http://email-service:3012';

      for (const alert of alerts) {
        try {
          // Fetch user email
          const userResponse = await fetch(`${userServiceUrl}/${alert.userId}`);
          if (!userResponse.ok) {
            console.error(`Failed to fetch user ${alert.userId} for alert: ${userResponse.status}`);
            continue;
          }

          const user = await userResponse.json();
          if (!user.email) {
            console.warn(`User ${alert.userId} has no email, skipping alert`);
            continue;
          }

          // Send email
          const emailPayload = {
            to: user.email,
            subject: `New Job matching your alert: ${job.title}`,
            text: `Hi ${user.firstName || 'Freelancer'},\n\nA new job matching your criteria was just posted and approved!\n\nTitle: ${job.title}\nCategory: ${job.category?.name || 'N/A'}\nBudget: ${job.budget || 'Competitive'}\n\nView it now on FreelanceHub.`
          };

          const emailResponse = await fetch(`${emailServiceUrl}/email/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailPayload),
          });

          if (!emailResponse.ok) {
            console.error(`Failed to send email to ${user.email}: ${await emailResponse.text()}`);
          } else {
            console.log(`Successfully sent job alert email to ${user.email} for job ${job.id}`);
          }
        } catch (err) {
          console.error(`Failed to process alert for user ${alert.userId}:`, err);
        }
      }
    } catch (error) {
      console.error('Job alert processing failed:', error);
    }
  }

  async createProposal(userId: string, dto: CreateProposalDto) {
    // 1. Check if job exists and is OPEN
    const job = await this.prisma.job.findUnique({
      where: { id: dto.jobId }
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${dto.jobId} not found`);
    }

    if (job.status !== 'OPEN') {
      throw new ForbiddenException(`You can only submit proposals to OPEN jobs. Current status: ${job.status}`);
    }

    // 2. Prevent client from applying to their own job
    if (job.client_id === userId) {
      throw new ForbiddenException('You cannot submit a proposal to your own job');
    }

    // 3. Check for duplicate proposal
    const existingProposal = await this.prisma.proposal.findFirst({
      where: {
        jobId: dto.jobId,
        freelancerId: userId
      }
    });

    if (existingProposal) {
      throw new ConflictException('You have already submitted a proposal for this job');
    }

    // 4. Connects Check & Deduction
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.availableConnects < 2) {
      throw new ForbiddenException('Insufficient connects (2 required)');
    }

    // 5. Create proposal and deduct connects
    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { availableConnects: { decrement: 2 } }
      });

      return tx.proposal.create({
        data: {
          jobId: dto.jobId,
          freelancerId: userId,
          coverLetter: dto.coverLetter,
          bidAmount: dto.bidAmount,
          timeline: dto.timeline,
          attachments: dto.attachments || [],
          portfolioItemIds: dto.portfolioItemIds || []
        }
      });
    });
  }

  async getMyProposals(userId: string) {
    return this.prisma.proposal.findMany({
      where: {
        freelancerId: userId
      },
      include: {
        job: {
          select: {
            title: true,
            type: true,
            budget: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async withdrawProposal(userId: string, proposalId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId }
    });

    if (!proposal) {
      throw new NotFoundException(`Proposal with ID ${proposalId} not found`);
    }

    if (proposal.freelancerId !== userId) {
      throw new ForbiddenException('You can only withdraw your own proposals');
    }

    const nonWithdrawableStatuses = ['HIRED', 'REJECTED', 'WITHDRAWN'];
    if (nonWithdrawableStatuses.includes(proposal.status)) {
      throw new BadRequestException(`Cannot withdraw proposal with status: ${proposal.status}`);
    }

    return this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'WITHDRAWN' }
    });
  }

  async duplicateProposal(userId: string, proposalId: string, toJobId?: string) {
    const original = await this.prisma.proposal.findUnique({
      where: { id: proposalId }
    });

    if (!original) {
      throw new NotFoundException(`Proposal with ID ${proposalId} not found`);
    }

    if (original.freelancerId !== userId) {
      throw new ForbiddenException('You can only duplicate your own proposals');
    }

    const cloneData = {
      coverLetter: original.coverLetter,
      bidAmount: original.bidAmount ? Number(original.bidAmount) : undefined,
      timeline: original.timeline,
      attachments: original.attachments,
      portfolioItemIds: original.portfolioItemIds,
    };

    if (toJobId) {
      const targetJob = await this.prisma.job.findUnique({ where: { id: toJobId } });
      if (!targetJob || targetJob.status !== 'OPEN') {
        throw new BadRequestException('Target job must be OPEN to receive a proposal');
      }

      const existing = await this.prisma.proposal.findFirst({
        where: { jobId: toJobId, freelancerId: userId, NOT: { status: 'WITHDRAWN' } }
      });
      if (existing) {
        throw new ConflictException('You have already submitted a proposal for this job');
      }

      // Check connects
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.availableConnects < 2) {
        throw new ForbiddenException('Insufficient connects (2 required)');
      }

      return this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { availableConnects: { decrement: 2 } }
        });

        return tx.proposal.create({
          data: {
            ...cloneData,
            jobId: toJobId,
            freelancerId: userId,
            status: 'PENDING'
          }
        });
      });
    }

    return cloneData;
  }

  async sendOffer(userId: string, proposalId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { job: true }
    });

    if (!proposal) {
      throw new BadRequestException('Proposal not found');
    }

    // In a real app, verify userId owns the job.
    // const job = await this.prisma.job.findUnique({ where: { id: proposal.jobId } });
    // if (job.client_id !== userId) throw new ForbiddenException(...);

    // Update status to HIRED
    const updatedProposal = await this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'HIRED' }
    });

    // Send Notification
    try {
      // Use the internal docker service name and port 3007
      const notificationUrl = 'http://notification-service:3007'; // Root path as per fix
      await this.httpService.axiosRef.post(notificationUrl, {
        userId: proposal.freelancerId,
        type: 'JOB_OFFER',
        title: 'You received a Job Offer!',
        message: `Congratulations! You have been hired for the job: ${proposal.job.title}`,
        metadata: {
          jobId: proposal.jobId,
          proposalId: proposal.id
        }
      });
    } catch (error) {
      console.error('Failed to send notification:', error.message);
      // Don't fail the request if notification fails, just log it.
    }

    return updatedProposal;
  }
}
