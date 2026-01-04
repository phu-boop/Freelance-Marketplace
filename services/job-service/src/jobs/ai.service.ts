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

    async generateMilestones(description: string, budget?: number) {
        if (!this.genAI) {
            return this.mockMilestones(budget);
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `
      You are an expert project manager. 
      Based on the following job description, suggest 3-5 logical milestones for the project.
      
      Job Description: ${description}
      ${budget ? `Total Budget: $${budget}` : ''}
      
      Return the result EXCLUSIVELY as a JSON array of objects with the following structure:
      [
        {
          "title": "Milestone Title",
          "description": "Short description of deliverables",
          "percentage": 25 (the percentage of the total budget this milestone represents)
        }
      ]
      
      Rules:
      1. Ensure percentages sum up to exactly 100.
      2. Keep descriptions concise.
      3. Return ONLY the JSON array, no extra text.
    `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extract JSON if there's markdown fluff
            const jsonMatch = text.match(/\[.*\]/s);
            const cleanJson = jsonMatch ? jsonMatch[0] : text;

            return JSON.parse(cleanJson);
        } catch (error) {
            this.logger.error(`Gemini Error: ${error.message}`);
            return this.mockMilestones(budget);
        }
    }

    async analyzeCommunicationStyle(messages: string[]) {
        if (!this.genAI || messages.length === 0) {
            return 'Proactive'; // Default
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

        const history = messages.join('\n');
        const prompt = `
      Analyze the following communication history and categorize the sender's communication style.
      
      Communication History:
      ${history}
      
      Return ONLY one of the following categories: "Proactive", "Formal", "Concise", "Casual", "Instructional".
      Do not return any other text.
    `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const style = response.text().trim();

            // Validate output
            const validStyles = ["Proactive", "Formal", "Concise", "Casual", "Instructional"];
            return validStyles.includes(style) ? style : 'Proactive';
        } catch (error) {
            this.logger.error(`Gemini Error in style analysis: ${error.message}`);
            return 'Proactive';
        }
    }

    async detectFraud(content: string) {
        const isDummyKey = this.configService.get<string>('GEMINI_API_KEY') === 'YOUR_GEMINI_API_KEY_HERE';
        if (!this.genAI || !content || isDummyKey) {
            return this.mockDetectFraud(content);
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `
      Analyze the following chat message for potential fraud, scams, or violations of marketplace policy.
      
      Message Content: "${content}"
      
      Look specifically for:
      1. Requests to move communication or payment off-platform (e.g., WhatsApp, Telegram, PayPal, Bank Transfer).
      2. Phishing (requests for passwords, login details, or sensitive IDs).
      3. Spam (unsolicited commercial messages, repetitive low-quality content).
      4. Suspiciously high-paying offers for very simple tasks.
      
      Return the result EXCLUSIVELY as a JSON object:
      {
        "isFlagged": boolean,
        "reason": "Clear explanation of the risk (e.g., 'Off-platform payment request detected')" or null if not flagged
      }
      
      If the message is safe and professional, set isFlagged to false.
    `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{.*\}/s);
            const cleanJson = jsonMatch ? jsonMatch[0] : text;

            return JSON.parse(cleanJson);
        } catch (error) {
            this.logger.error(`Gemini Error in fraud detection: ${error.message}`);
            return this.mockDetectFraud(content);
        }
    }

    private mockDetectFraud(content: string) {
        const lowerContent = content.toLowerCase();
        const offPlatformKeywords = ['whatsapp', 'telegram', 'paypal', 'direct pay', 'bank transfer', 'outside the platform'];
        const phishingKeywords = ['password', 'login', 'credentials', 'bank pin'];

        for (const kw of offPlatformKeywords) {
            if (lowerContent.includes(kw)) {
                return { isFlagged: true, reason: `Off-platform contact/payment request detected ('${kw}')` };
            }
        }

        for (const kw of phishingKeywords) {
            if (lowerContent.includes(kw)) {
                return { isFlagged: true, reason: `Potential phishing attempt detected ('${kw}')` };
            }
        }

        return { isFlagged: false, reason: null };
    }

    private mockMilestones(budget?: number) {
        return [
            {
                title: 'Project Kickoff & Requirements',
                description: 'Detailed project plan and environment setup.',
                percentage: 20,
            },
            {
                title: 'Core Development - Phase 1',
                description: 'Implementation of primary features.',
                percentage: 40,
            },
            {
                title: 'Final Implementation & Testing',
                description: 'Remaining features and comprehensive bug fixing.',
                percentage: 30,
            },
            {
                title: 'Handover & Documentation',
                description: 'Final delivery and documentation handoff.',
                percentage: 10,
            }
        ];
    }

    private mockProposal(job: any, user: any) {
        return {
            content: `Hello! I noticed your job posting for "${job.title}" and I'm very interested in helping you. With my background in ${user?.skills?.slice(0, 3).join(', ') || 'related fields'}, I am confident that I can deliver high-quality results. I have experience with ${job.skills.slice(0, 2).map(s => s.skill.name).join(' and ')} which aligns perfectly with your requirements. Looking forward to discussing this further!`,
            isMock: true
        };
    }
}
