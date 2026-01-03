import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private genAI: GoogleGenerativeAI;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
        private httpService: HttpService,
    ) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
        } else {
            this.logger.warn('GEMINI_API_KEY not found. AI features will be mocked.');
        }
    }

    async generateProposal(jobId: string, userId: string) {
        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
            include: { category: true, skills: { include: { skill: true } } },
        });

        if (!job) {
            throw new NotFoundException('Job not found');
        }

        // Fetch user profile from user-service
        let userProfile: any = null;
        try {
            const userServiceUrl = this.configService.get<string>('USER_SERVICE_INTERNAL_URL', 'http://user-service:3000/api/users');
            const { data } = await firstValueFrom(
                this.httpService.get(`${userServiceUrl}/${userId}`)
            );
            userProfile = data;
        } catch (error) {
            this.logger.error(`Failed to fetch user profile: ${error.message}`);
        }

        if (!this.genAI) {
            return this.mockProposal(job, userProfile);
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `
      You are a professional freelancer on a marketplace. 
      Write a compelling job proposal for the following job:
      
      Job Title: ${job.title}
      Job Description: ${job.description}
      Category: ${job.category?.name}
      Required Skills: ${job.skills.map(s => s.skill.name).join(', ')}
      
      Freelancer Name: ${userProfile?.firstName} ${userProfile?.lastName}
      Freelancer Skills: ${userProfile?.skills?.join(', ') || 'N/A'}
      Freelancer Bio: ${userProfile?.overview || 'N/A'}
      
      Instructions:
      1. Be professional and persuasive.
      2. Highlight relevant skills and experience.
      3. Keep it concise (3-4 paragraphs).
      4. Use a friendly yet professional tone.
      5. Don't use placeholders like [Your Name], use the provided name.
      6. Focus on how you can solve the client's problem.
    `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return { content: response.text() };
        } catch (error) {
            this.logger.error(`Gemini Error: ${error.message}`);
            return this.mockProposal(job, userProfile);
        }
    }

    private mockProposal(job: any, user: any) {
        return {
            content: `Hello! I noticed your job posting for "${job.title}" and I'm very interested in helping you. With my background in ${user?.skills?.slice(0, 3).join(', ') || 'related fields'}, I am confident that I can deliver high-quality results. I have experience with ${job.skills.slice(0, 2).map(s => s.skill.name).join(' and ')} which aligns perfectly with your requirements. Looking forward to discussing this further!`,
            isMock: true
        };
    }
}
