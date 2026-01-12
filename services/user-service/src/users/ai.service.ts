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

    async generatePortfolioItem(freelancerId: string, contractId: string) {
        // 1. Fetch Contract Details from contract-service
        const contractServiceUrl = this.configService.get<string>('CONTRACT_SERVICE_URL', 'http://contract-service:3002');
        let contractData: any = null;
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${contractServiceUrl}/api/contracts/${contractId}`)
            );
            contractData = data;
        } catch (error) {
            this.logger.error(`Failed to fetch contract ${contractId}: ${error.message}`);
            throw new NotFoundException('Contract data not available');
        }

        // 2. Fetch Job Details from job-service
        const jobServiceUrl = this.configService.get<string>('JOB_SERVICE_URL', 'http://job-service:3001');
        let jobData: any = null;
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${jobServiceUrl}/api/jobs/${contractData.job_id}`)
            );
            jobData = data;
        } catch (error) {
            this.logger.error(`Failed to fetch job ${contractData.job_id}: ${error.message}`);
        }

        if (!this.genAI) {
            return this.mockPortfolioItem(freelancerId, contractData, jobData);
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `
      You are an expert career consultant.
      Based on the following project data, generate a portfolio item for the freelancer.
      
      Job Title: ${jobData?.title || 'Unknown Project'}
      Job Description: ${jobData?.description || 'N/A'}
      Contract Amount: $${contractData.totalAmount}
      Skills Used: ${jobData?.skills?.map((s: any) => s.skill.name).join(', ') || 'N/A'}
      
      Instructions:
      1. Create a professional, catchy title for the portfolio item.
      2. Write a 2-3 sentence description of the work performed and value delivered.
      3. Identify 3-5 key skills demonstrated in this project.
      
      Return the result EXCLUSIVELY as a JSON object:
      {
        "title": "string",
        "description": "string",
        "skills": ["skill1", "skill2"]
      }
    `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{.*\}/s);
            const cleanJson = jsonMatch ? jsonMatch[0] : text;
            const portfolioData = JSON.parse(cleanJson);

            return this.prisma.portfolioItem.create({
                data: {
                    userId: freelancerId,
                    title: portfolioData.title,
                    description: portfolioData.description,
                    skills: portfolioData.skills,
                    imageUrl: 'https://placehold.co/600x400/png?text=Project+Thumbnail', // Default
                    source: 'AI_GENERATED',
                    completionDate: new Date(contractData.updatedAt),
                },
            });
        } catch (error) {
            this.logger.error(`Gemini Error in portfolio generation: ${error.message}`);
            return this.mockPortfolioItem(freelancerId, contractData, jobData);
        }
    }

    private async mockPortfolioItem(userId: string, contract: any, job: any) {
        return this.prisma.portfolioItem.create({
            data: {
                userId,
                title: `Completed ${job?.title || 'Project'}`,
                description: `Successfully delivered ${job?.title || 'the project'} with a total volume of $${contract.totalAmount}. Highlights include high-quality deliverables and efficient timeline management.`,
                skills: job?.skills?.map((s: any) => s.skill.name) || ['Project Management'],
                imageUrl: 'https://placehold.co/600x400/png?text=AI+Generated+Project',
                source: 'AI_GENERATED',
                completionDate: new Date(contract.updatedAt),
            },
        });
    }

    async analyzeContractRisk(contractId: string) {
        // Implement risk analysis for A-058
        const contractServiceUrl = this.configService.get<string>('CONTRACT_SERVICE_URL', 'http://contract-service:3002');
        let contractData: any = null;
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${contractServiceUrl}/api/contracts/${contractId}`)
            );
            contractData = data;
        } catch (error) {
            this.logger.error(`Failed to fetch contract ${contractId}: ${error.message}`);
            return null;
        }

        const clauses = JSON.stringify(contractData.customClauses || []);

        if (!this.genAI) {
            return {
                riskLevel: 'LOW',
                flaggedClauses: [],
                analysis: '(Mocked) No high-risk clauses detected in basic contract scan.'
            };
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `
            Analyze the following contract custom clauses for risks to either the freelancer or the client.
            Look for: IP ownership issues, excessive liability, non-compete overreach, and payment ambiguity.

            Clauses: ${clauses}

            Return EXCLUSIVELY a JSON object:
            {
                "riskLevel": "LOW" | "MEDIUM" | "HIGH",
                "flaggedClauses": [{"title": "string", "reason": "string"}],
                "analysis": "2-3 sentence summary of risks"
            }
        `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const jsonMatch = text.match(/\{.*\}/s);
            return JSON.parse(jsonMatch ? jsonMatch[0] : text);
        } catch (error) {
            this.logger.error(`Gemini risk analysis error: ${error.message}`);
            return null;
        }
    }
}
