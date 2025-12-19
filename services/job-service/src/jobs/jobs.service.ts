import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) { }

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

    return this.prisma.job.create({
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
  }

  findAll() {
    return this.prisma.job.findMany({
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

  findOne(id: string) {
    return this.prisma.job.findUnique({
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
  }

  async update(id: string, updateJobDto: UpdateJobDto) {
    const { skillIds, ...jobData } = updateJobDto as any;

    // If skillIds are provided, we need to reset them
    if (skillIds) {
      await this.prisma.jobSkill.deleteMany({ where: { jobId: id } });
    }

    return this.prisma.job.update({
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
  }

  remove(id: string) {
    return this.prisma.job.delete({
      where: { id },
    });
  }

  // Admin Actions
  approveJob(id: string) {
    return this.prisma.job.update({
      where: { id },
      data: { status: 'OPEN' }
    });
  }

  rejectJob(id: string) {
    return this.prisma.job.update({
      where: { id: id },
      data: { status: 'REJECTED' }
    });
  }

  closeJob(id: string) {
    return this.prisma.job.update({
      where: { id: id },
      data: { status: 'CLOSED' }
    });
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
  createCategory(name: string) {
    return this.prisma.category.create({ data: { name } });
  }

  findAllCategories() {
    return this.prisma.category.findMany();
  }

  // Taxonomy - Skills
  createSkill(name: string) {
    return this.prisma.skill.create({ data: { name } });
  }

  findAllSkills() {
    return this.prisma.skill.findMany();
  }
}
