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

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Default 30 days

    const job = await this.prisma.job.create({
      data: {
        ...jobData,
        expiresAt,
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
        status: job.status,
        isPromoted: job.isPromoted || false
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

  findByClient(clientId: string, status?: string) {
    const where: any = { client_id: clientId };
    if (status) {
      where.status = status;
    }

    return this.prisma.job.findMany({
      where,
      include: {
        category: true,
        skills: {
          include: {
            skill: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async trackEvent(eventType: string, userId: string, jobId?: string, metadata: any = {}) {
    try {
      const analyticsUrl = process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:3014';
      await fetch(`${analyticsUrl}/analytics/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          user_id: userId,
          job_id: jobId || '',
          metadata: JSON.stringify(metadata)
        }),
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  async findOne(id: string, viewerId?: string) {
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

    // Track view asynchronously
    this.trackEvent('job_view', viewerId || 'anonymous', id);

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

  async duplicateJob(id: string, userId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { skills: true }
    });
    if (!job) throw new NotFoundException('Job not found');

    if (job.client_id !== userId) {
      throw new ForbiddenException('You can only duplicate your own jobs');
    }

    const { id: _, createdAt: __, updatedAt: ___, status: ____, expiresAt: _____, ...jobData } = job;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    return this.prisma.job.create({
      data: {
        ...jobData,
        title: `${job.title} (Copy)`,
        status: 'PENDING_APPROVAL',
        expiresAt,
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

    // Update status to OFFERED
    const updatedProposal = await this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'OFFERED' }
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
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      // Don't fail the request if notification fails, just log it.
    }

    return updatedProposal;
  }

  async acceptOffer(userId: string, proposalId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { job: true }
    });

    if (!proposal) {
      throw new BadRequestException('Proposal not found');
    }

    if (proposal.freelancerId !== userId) {
      throw new ForbiddenException('You can only accept offers sent to you');
    }

    if (proposal.status !== 'OFFERED') {
      throw new BadRequestException('Proposal is not in OFFERED status');
    }

    return this.prisma.$transaction([
      this.prisma.proposal.update({
        where: { id: proposalId },
        data: { status: 'HIRED' }
      }),
      this.prisma.job.update({
        where: { id: proposal.jobId },
        data: { status: 'IN_PROGRESS' }
      })
    ]);
  }

  async declineOffer(userId: string, proposalId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId }
    });

    if (!proposal) {
      throw new BadRequestException('Proposal not found');
    }

    if (proposal.freelancerId !== userId) {
      throw new ForbiddenException('You can only decline offers sent to you');
    }

    if (proposal.status !== 'OFFERED') {
      throw new BadRequestException('Proposal is not in OFFERED status');
    }

    return this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'WITHDRAWN' }
    });
  }

  async counterOffer(userId: string, proposalId: string, dto: { amount: number, timeline: string }) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { job: true }
    });

    if (!proposal) {
      throw new BadRequestException('Proposal not found');
    }

    if (proposal.freelancerId !== userId) {
      throw new ForbiddenException('You can only counter offers sent to you');
    }

    if (proposal.status !== 'OFFERED' && proposal.status !== 'NEGOTIATION') {
      // Allow countering if it's already in negotiation or offered
      throw new BadRequestException('Proposal is not in OFFERED or NEGOTIATION status');
    }

    // Update proposal and notify client (in real app)
    const updated = await this.prisma.proposal.update({
      where: { id: proposalId },
      data: {
        bidAmount: dto.amount,
        timeline: dto.timeline,
        status: 'NEGOTIATION'
      }
    });

    // Notify Client
    try {
      const notificationUrl = 'http://notification-service:3007';
      await this.httpService.axiosRef.post(notificationUrl, {
        userId: proposal.job.client_id,
        type: 'COUNTER_OFFER',
        title: 'Counter Offer Received',
        message: `Freelancer has sent a counter offer for: ${proposal.job.title}`,
        metadata: {
          jobId: proposal.jobId,
          proposalId: proposal.id
        }
      });
    } catch (e) {
      console.error('Failed to notify client of counter offer', e.message);
    }

    return updated;
  }

  async getContracts(userId: string, status: string[] = ['HIRED']) {
    return this.prisma.proposal.findMany({
      where: {
        freelancerId: userId,
        status: { in: status }
      },
      include: {
        job: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
  }

  async getContractDetails(contractId: string, userId: string) {
    const contract = await this.prisma.proposal.findUnique({
      where: { id: contractId },
      include: {
        job: true,
        milestones: {
          include: {
            submissions: {
              orderBy: { createdAt: 'desc' }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.freelancerId !== userId && contract.job.client_id !== userId) {
      throw new ForbiddenException('Not authorized to view this contract');
    }

    return contract;
  }

  async requestChanges(milestoneId: string, clientId: string, feedback: string) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        proposal: {
          include: { job: true }
        }
      }
    });

    if (!milestone) throw new NotFoundException('Milestone not found');
    if (milestone.proposal.job.client_id !== clientId) throw new ForbiddenException('Only the client can request changes');
    if (milestone.status !== 'SUBMITTED') throw new BadRequestException('Can only request changes on submitted work');

    return this.prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        status: 'CHANGES_REQUESTED'
      }
    });
  }

  async addMilestone(proposalId: string, userId: string, dto: { description: string, amount: number, dueDate?: string }) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { job: true }
    });

    if (!proposal) throw new NotFoundException('Contract not found');

    // Only allow adding milestone if you are involved (freelancer or client)
    if (proposal.freelancerId !== userId && proposal.job.client_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.milestone.create({
      data: {
        proposalId,
        description: dto.description,
        amount: dto.amount,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        status: 'PENDING'
      }
    });
  }

  async addAttachment(proposalId: string, userId: string, fileName: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { job: true }
    });

    if (!proposal) throw new NotFoundException('Contract not found');

    // Auth check: Is user either freelancer or client for this contract?
    if (proposal.freelancerId !== userId && proposal.job.client_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.proposal.update({
      where: { id: proposalId },
      data: {
        attachments: {
          push: fileName
        }
      }
    });
  }

  async submitMilestone(milestoneId: string, freelancerId: string, dto: { content: string, attachments?: string[] }) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        proposal: {
          include: { job: true }
        }
      }
    });

    if (!milestone) throw new NotFoundException('Milestone not found');
    if (milestone.proposal.freelancerId !== freelancerId) throw new ForbiddenException('Only the freelancer can submit work');

    return this.prisma.$transaction(async (prisma) => {
      const submission = await prisma.submission.create({
        data: {
          milestoneId,
          freelancerId,
          content: dto.content,
          attachments: dto.attachments || [],
        }
      });

      await prisma.milestone.update({
        where: { id: milestoneId },
        data: { status: 'SUBMITTED' }
      });

      // Notify Client
      const description = milestone.description.length > 30 ? milestone.description.substring(0, 30) + '...' : milestone.description;
      await this.sendNotification(
        milestone.proposal.job.client_id,
        'PAYMENT_REQUESTED',
        `Payment Requested: ${description}`,
        `Freelancer has submitted work for milestone '${description}'. Please review and release payment.`,
        { milestoneId, contractId: milestone.proposalId }
      );

      return submission;
    });
  }

  private async sendNotification(userId: string, type: string, title: string, message: string, metadata?: any) {
    try {
      const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3007';
      await this.httpService.axiosRef.post(`${notificationUrl}/api/notifications`, {
        userId,
        type,
        title,
        message,
        metadata
      });
    } catch (error) {
      console.error('Failed to send notification', error.message);
      // Suppress error so core logic doesn't fail
    }
  }

  async approveMilestone(milestoneId: string, clientId: string) {
    const milestone = await this.prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        proposal: {
          include: { job: true }
        }
      }
    });

    if (!milestone) throw new NotFoundException('Milestone not found');
    if (milestone.proposal.job.client_id !== clientId) throw new ForbiddenException('Only the client can approve work');
    if (milestone.status !== 'SUBMITTED') throw new BadRequestException('Milestone is not in SUBMITTED state');

    // Transfer funds
    try {
      const paymentUrl = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3005';
      const response = await this.httpService.axiosRef.post(`${paymentUrl}/payments/transfer`, {
        fromUserId: milestone.proposal.job.client_id,
        toUserId: milestone.proposal.freelancerId,
        amount: Number(milestone.amount),
        description: `Payment for Milestone: ${milestone.description}`,
        referenceId: milestone.proposalId,
      });

      return this.prisma.milestone.update({
        where: { id: milestoneId },
        data: { status: 'PAID' }
      });
    } catch (error) {
      console.error('Payment transfer failed', error.response?.data || error.message);

      await this.prisma.milestone.update({
        where: { id: milestoneId },
        data: { status: 'COMPLETED' }
      });
      throw new BadRequestException('Work approved but payment transfer failed');
    }
  }

  async updateProgress(contractId: string, userId: string, progress: number) {
    const contract = await this.prisma.proposal.findUnique({
      where: { id: contractId },
    });

    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.freelancerId !== userId) throw new ForbiddenException('Only the freelancer can update progress');
    if (progress < 0 || progress > 100) throw new BadRequestException('Progress must be between 0 and 100');

    return this.prisma.proposal.update({
      where: { id: contractId },
      data: { progress },
    });
  }

  async requestExtension(contractId: string, userId: string, date: Date, reason: string) {
    const contract = await this.prisma.proposal.findUnique({
      where: { id: contractId },
      include: { job: true }
    });

    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.freelancerId !== userId) throw new ForbiddenException('Only the freelancer can request extension');

    const updatedContract = await this.prisma.proposal.update({
      where: { id: contractId },
      data: {
        extensionRequestDate: date,
        extensionRequestReason: reason,
        extensionRequestStatus: 'PENDING'
      }
    });

    // Notify Client
    await this.sendNotification(
      contract.job.client_id,
      'EXTENSION_REQUESTED',
      'Contract Extension Requested',
      `Freelancer has requested to extend the contract deadline to ${new Date(date).toLocaleDateString()}. Reason: ${reason}`,
      { contractId }
    );

    return updatedContract;
  }

  async terminateContract(contractId: string, userId: string, reason: string) {
    const contract = await this.prisma.proposal.findUnique({
      where: { id: contractId },
      include: { job: true }
    });

    if (!contract) throw new NotFoundException('Contract not found');

    // Allow either freelancer or client to terminate
    if (contract.freelancerId !== userId && contract.job.client_id !== userId) {
      throw new ForbiddenException('Only parties involved in the contract can terminate it');
    }

    const updatedContract = await this.prisma.proposal.update({
      where: { id: contractId },
      data: {
        status: 'TERMINATED',
      }
    });

    // Notify the other party
    const targetUserId = userId === contract.freelancerId ? contract.job.client_id : contract.freelancerId;
    await this.sendNotification(
      targetUserId,
      'CONTRACT_TERMINATED',
      'Contract Terminated',
      `The contract for '${contract.job.title}' has been terminated by the other party. Reason: ${reason}`,
      { contractId }
    );

    return updatedContract;
  }
  async getProposalById(id: string, userId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            skills: {
              include: { skill: true }
            }
          }
        }
      }
    });

    if (!proposal) {
      throw new NotFoundException(`Proposal with ID ${id} not found`);
    }

    // Authorization check: Freelancer (owner) or Client (job owner)
    if (proposal.freelancerId !== userId && proposal.job.client_id !== userId) {
      throw new ForbiddenException('You are not authorized to view this proposal');
    }

    return proposal;
  }

  async getProposalsByJobId(jobId: string, userId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId }
    });
    if (!job) throw new NotFoundException('Job not found');

    // In this specific app, let's allow the job owner to see all proposals.
    if (job.client_id !== userId) {
      throw new ForbiddenException('Only the job owner can view proposals');
    }

    return this.prisma.proposal.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async negotiateProposal(userId: string, proposalId: string, dto: { amount?: number, timeline?: string }) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { job: true }
    });

    if (!proposal) throw new NotFoundException('Proposal not found');

    // Only freelancer or client can negotiate
    if (proposal.freelancerId !== userId && proposal.job.client_id !== userId) {
      throw new ForbiddenException('You are not authorized to negotiate this proposal');
    }

    const updated = await this.prisma.proposal.update({
      where: { id: proposalId },
      data: {
        bidAmount: dto.amount ?? proposal.bidAmount,
        timeline: dto.timeline ?? proposal.timeline,
        status: 'NEGOTIATION'
      }
    });

    // Notify the other party
    const targetUserId = userId === proposal.freelancerId ? proposal.job.client_id : proposal.freelancerId;
    await this.sendNotification(
      targetUserId,
      'NEGOTIATION_UPDATE',
      'Proposal Negotiation',
      `Proposal terms for '${proposal.job.title}' have been updated.`,
      { proposalId }
    );

    return updated;
  }

  // Service Packages
  async createServicePackage(userId: string, dto: any) {
    return this.prisma.servicePackage.create({
      data: {
        ...dto,
        freelancerId: userId,
      }
    });
  }

  async findServicePackages(freelancerId?: string) {
    const where = freelancerId ? { freelancerId } : {};
    return this.prisma.servicePackage.findMany({
      where,
      include: { category: true }
    });
  }

  async findOneServicePackage(id: string) {
    const pkg = await this.prisma.servicePackage.findUnique({
      where: { id },
      include: { category: true }
    });
    if (!pkg) throw new NotFoundException('Service Package not found');
    return pkg;
  }

  async updateServicePackage(id: string, userId: string, dto: any) {
    const pkg = await this.findOneServicePackage(id);
    if (pkg.freelancerId !== userId) {
      throw new ForbiddenException('You can only update your own service packages');
    }
    return this.prisma.servicePackage.update({
      where: { id },
      data: dto
    });
  }

  async deleteServicePackage(id: string, userId: string) {
    return this.prisma.servicePackage.delete({
      where: { id }
    });
  }

  // Interviews
  async scheduleInterview(clientId: string, dto: any) {
    const job = await this.prisma.job.findUnique({ where: { id: dto.jobId } });
    if (!job || job.client_id !== clientId) {
      throw new ForbiddenException('Only the job owner can schedule interviews');
    }

    return this.prisma.interview.create({
      data: {
        ...dto,
        scheduledAt: new Date(dto.scheduledAt),
      }
    });
  }

  async getInterviews(userId: string, role: string) {
    if (role === 'CLIENT') {
      return this.prisma.interview.findMany({
        where: { job: { client_id: userId } },
        include: { job: true }
      });
    } else {
      return this.prisma.interview.findMany({
        where: { freelancerId: userId },
        include: { job: true }
      });
    }
  }

  async updateInterview(id: string, userId: string, dto: any) {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
      include: { job: true }
    });
    if (!interview) throw new NotFoundException('Interview not found');

    // Either party can update (cancel/reschedule)
    if (interview.job.client_id !== userId && interview.freelancerId !== userId) {
      throw new ForbiddenException('You are not authorized to update this interview');
    }

    return this.prisma.interview.update({
      where: { id },
      data: {
        ...dto,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : interview.scheduledAt
      }
    });
  }

  async startMeeting(id: string, userId: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
      include: { job: true }
    });
    if (!interview) throw new NotFoundException('Interview not found');

    if (interview.job.client_id !== userId && interview.freelancerId !== userId) {
      throw new ForbiddenException('Only participants can start the meeting');
    }

    const meetingUrl = `https://meet.jit.si/freelance-marketplace-${id}`;

    const updated = await this.prisma.interview.update({
      where: { id },
      data: { meetingUrl, status: 'IN_PROGRESS' }
    });

    // Notify other party
    const targetUserId = userId === interview.freelancerId ? interview.job.client_id : interview.freelancerId;
    await this.sendNotification(
      targetUserId,
      'MEETING_STARTED',
      'Interview Started',
      `The video call for your interview has started.`,
      { interviewId: id, meetingUrl }
    );

    return updated;
  }

  async extendJobDuration(id: string, userId: string, days: number = 30) {
    const job = await this.prisma.job.findUnique({
      where: { id }
    });

    if (!job) throw new NotFoundException('Job not found');

    if (job.client_id !== userId) {
      throw new ForbiddenException('You can only extend your own jobs');
    }

    const currentExpiry = job.expiresAt ? new Date(job.expiresAt) : new Date();
    const newExpiry = new Date(currentExpiry);
    newExpiry.setDate(newExpiry.getDate() + days);

    return this.prisma.job.update({
      where: { id },
      data: { expiresAt: newExpiry }
    });
  }

  async promoteJob(id: string, userId: string) {
    const PROMOTION_COST = 10;

    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { category: true, skills: { include: { skill: true } } }
    });

    if (!job) throw new NotFoundException('Job not found');

    if (job.client_id !== userId) {
      throw new ForbiddenException('You can only promote your own jobs');
    }

    if (job.isPromoted) {
      throw new BadRequestException('Job is already promoted');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.availableConnects < PROMOTION_COST) {
      throw new BadRequestException(`Insufficient connects. Promotion costs ${PROMOTION_COST} connects.`);
    }

    const promotionExpiresAt = new Date();
    promotionExpiresAt.setDate(promotionExpiresAt.getDate() + 7); // Default 7 days promotion

    const updatedJob = await this.prisma.$transaction(async (tx) => {
      // Deduct connects
      await tx.user.update({
        where: { id: userId },
        data: { availableConnects: { decrement: PROMOTION_COST } }
      });

      // Update job
      return tx.job.update({
        where: { id },
        data: {
          isPromoted: true,
          promotionExpiresAt
        },
        include: { category: true, skills: { include: { skill: true } } }
      });
    });

    // Sync to search service
    await this.syncToSearch(updatedJob);

    // Track promotion
    await this.trackEvent('job_promoted', userId, id);

    return updatedJob;
  }

  async getJobAnalytics(id: string, userId: string) {
    const job = await this.prisma.job.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.client_id !== userId) throw new ForbiddenException('Only the job owner can view analytics');

    try {
      const analyticsUrl = process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:3014';
      const response = await fetch(`${analyticsUrl}/analytics/jobs/${id}`);
      if (!response.ok) throw new Error('Failed to fetch from analytics service');

      const stats = await response.json();

      // Combine with proposal data from Postgres
      const proposalCount = await this.prisma.proposal.count({ where: { jobId: id } });
      const interviewCount = await this.prisma.interview.count({ where: { jobId: id } });

      return {
        ...stats,
        total_proposals: proposalCount,
        total_interviews: interviewCount,
        hiring_rate: proposalCount > 0 ? (interviewCount / proposalCount) * 100 : 0
      };
    } catch (error) {
      console.error(`Failed to get analytics for job ${id}:`, error);
      throw new BadRequestException('Analytics service unavailable');
    }
  }
}
