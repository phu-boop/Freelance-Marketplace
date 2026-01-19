import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { BadgesService } from './badges.service';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private httpService: HttpService,
    private badgesService: BadgesService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      this.logger.warn('GEMINI_API_KEY not found. AI features will be mocked.');
    }
  }

  async generatePortfolioItem(freelancerId: string, contractId: string) {
    // 0. Check if already exists to avoid duplicates
    const existing = await this.prisma.portfolioItem.findFirst({
      where: { userId: freelancerId, externalId: contractId },
    });
    if (existing) {
      this.logger.log(
        `Portfolio item for contract ${contractId} already exists. Skipping.`,
      );
      return existing;
    }

    // 1. Fetch Contract Details from contract-service
    const contractServiceUrl = this.configService.get<string>(
      'CONTRACT_SERVICE_URL',
      'http://contract-service:3002',
    );
    let contractData: any = null;
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${contractServiceUrl}/api/contracts/${contractId}`,
        ),
      );
      contractData = data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch contract ${contractId}: ${error.message}`,
      );
      throw new NotFoundException('Contract data not available');
    }

    // 2. Fetch Job Details from job-service
    const jobServiceUrl = this.configService.get<string>(
      'JOB_SERVICE_URL',
      'http://job-service:3001',
    );
    let jobData: any = null;
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${jobServiceUrl}/api/jobs/${contractData.job_id}`,
        ),
      );
      jobData = data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch job ${contractData.job_id}: ${error.message}`,
      );
    }

    if (!this.genAI) {
      return this.mockPortfolioItem(freelancerId, contractData, jobData);
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
      You are an expert career consultant.
      Based on the following project data, generate a professional portfolio item for the freelancer.
      
      Job Title: ${jobData?.title || 'Unknown Project'}
      Job Description: ${jobData?.description || 'N/A'}
      Contract Amount: $${contractData.totalAmount}
      Skills Used: ${jobData?.skills?.map((s: any) => s.skill.name).join(', ') || 'N/A'}
      
      Instructions:
      1. Create a professional, catchy title for the portfolio item.
      2. Write a 2-3 sentence description of the work performed, value delivered, and milestones reached.
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
          imageUrl: `https://placehold.co/600x400/png?text=${encodeURIComponent(portfolioData.title)}`, // Use title in thumbnail
          source: 'AI_GENERATED',
          externalId: contractId,
          completionDate: new Date(contractData.updatedAt || new Date()),
        },
      });
    } catch (error) {
      this.logger.error(
        `Gemini Error in portfolio generation: ${error.message}`,
      );
      return this.mockPortfolioItem(freelancerId, contractData, jobData);
    }
  }

  private async mockPortfolioItem(userId: string, contract: any, job: any) {
    return this.prisma.portfolioItem.create({
      data: {
        userId,
        title: `Completed ${job?.title || 'Project'}`,
        description: `Successfully delivered ${job?.title || 'the project'} with a total volume of $${contract.totalAmount}. Highlights include high-quality deliverables and efficient timeline management.`,
        skills: job?.skills?.map((s: any) => s.skill.name) || [
          'Project Management',
        ],
        imageUrl: 'https://placehold.co/600x400/png?text=AI+Generated+Project',
        source: 'AI_GENERATED',
        externalId: contract.id,
        completionDate: new Date(contract.updatedAt || new Date()),
      },
    });
  }

  async analyzeContractRisk(contractId: string) {
    // Implement risk analysis for A-058
    const contractServiceUrl = this.configService.get<string>(
      'CONTRACT_SERVICE_URL',
      'http://contract-service:3002',
    );
    let contractData: any = null;
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${contractServiceUrl}/api/contracts/${contractId}`,
        ),
      );
      contractData = data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch contract ${contractId}: ${error.message}`,
      );
      return null;
    }

    const clauses = JSON.stringify(contractData.customClauses || []);

    if (!this.genAI) {
      return {
        riskLevel: 'LOW',
        flaggedClauses: [],
        analysis:
          '(Mocked) No high-risk clauses detected in basic contract scan.',
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

  async generateSkillAssessment(userId: string, skillName: string) {
    if (!this.genAI) {
      return this.prisma.skillAssessment.create({
        data: {
          userId,
          skillName,
          questions: [
            { question: `Mock Question 1 for ${skillName}`, type: 'TEXT' },
            { question: `Mock Question 2 for ${skillName}`, type: 'TEXT' },
          ] as any,
          status: 'PENDING',
        },
      });
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `
            Generate 5 technical interview questions for the skill: ${skillName}.
            The questions should be challenging and test deep knowledge of the subject.
            
            Return EXCLUSIVELY a JSON array of objects:
            [
                {"question": "string", "type": "TEXT"}
            ]
        `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\[.*\]/s);
      const questions = JSON.parse(jsonMatch ? jsonMatch[0] : text);

      return this.prisma.skillAssessment.create({
        data: {
          userId,
          skillName,
          questions: questions,
          status: 'PENDING',
        },
      });
    } catch (error) {
      this.logger.error(
        `Gemini error in assessment generation: ${error.message}`,
      );
      throw error;
    }
  }

  async evaluateSkillAssessment(assessmentId: string, answers: any) {
    const assessment = await this.prisma.skillAssessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) throw new NotFoundException('Assessment not found');

    if (!this.genAI) {
      const score = 85; // Mock score
      return this.prisma.skillAssessment.update({
        where: { id: assessmentId },
        data: {
          answers: answers,
          score,
          status: score >= 80 ? 'COMPLETED' : 'FAILED',
          verifiedAt: score >= 80 ? new Date() : null,
        },
      });
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `
            Grade the following technical assessment for ${assessment.skillName}.
            
            Questions and Answers:
            ${JSON.stringify(assessment.questions)}
            User Answers:
            ${JSON.stringify(answers)}
            
            Instructions:
            1. Grade each answer fairly on a scale of 0-100.
            2. Provide an overall score (0-100).
            3. Provide a brief feedback summary.
            
            Return EXCLUSIVELY a JSON object:
            {
                "score": number,
                "feedback": "string"
            }
        `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\{.*\}/s);
      const evaluation = JSON.parse(jsonMatch ? jsonMatch[0] : text);

      const updatedAssessment = await this.prisma.skillAssessment.update({
        where: { id: assessmentId },
        data: {
          answers: answers,
          score: evaluation.score,
          status: evaluation.score >= 80 ? 'COMPLETED' : 'FAILED',
          verifiedAt: evaluation.score >= 80 ? new Date() : null,
        },
      });

      // Trigger automatic badge check
      await this.badgesService.checkEligibility(updatedAssessment.userId);

      return { ...updatedAssessment, feedback: evaluation.feedback };
    } catch (error) {
      this.logger.error(
        `Gemini error in assessment evaluation: ${error.message}`,
      );
      throw error;
    }
  }
  async verifyPortfolio(userId: string, itemUrl: string) {
    if (!this.genAI) {
      return {
        isVerified: true,
        confidence: 0.95,
        tags: ['React', 'Node.js', 'Mocked Verification'],
        feedback: 'Mocked: Excellent portfolio demonstrating core skills.',
      };
    }

    let content = '';
    try {
      const { data } = await firstValueFrom(this.httpService.get(itemUrl));
      // Naive text extraction: slice first 5000 chars to avoid token limits
      content =
        typeof data === 'string'
          ? data.substring(0, 5000)
          : JSON.stringify(data).substring(0, 5000);
    } catch (e) {
      this.logger.warn(`Could not fetch portfolio URL: ${e.message}`);
      content = 'Content could not be fetched. Verify based on URL pattern.';
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `
            You are a technical recruiter verifying a portfolio item.
            URL: ${itemUrl}
            
            Page Content Snippet (first 5k chars):
            ${content}

            Task:
            1. Determine if this is a valid portfolio item (e.g. GitHub repo, Behance project, personal site).
            2. Extract key technical skills or creative attributes demonstrated.
            3. Estimate confidence that this represents real work.

            Return EXCLUSIVELY a JSON object:
            {
                "isVerified": boolean,
                "confidence": number,
                "tags": ["skill1", "skill2"],
                "feedback": "string"
            }
        `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\{.*\}/s);
      return JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch (error) {
      this.logger.error(`Gemini verification error: ${error.message}`);
      return {
        isVerified: false,
        confidence: 0,
        tags: [],
        feedback: 'AI Verification Failed',
      };
    }
  }

  async verifyPortfolioItem(itemId: string) {
    const item = await this.prisma.portfolioItem.findUnique({
      where: { id: itemId },
    });

    if (!item) throw new NotFoundException('Portfolio item not found');

    const url = item.projectUrl || item.externalUrl;
    if (!url) {
      throw new BadRequestException('Portfolio item must have a URL for verification');
    }

    const result = await this.verifyPortfolio(item.userId, url);

    return this.prisma.portfolioItem.update({
      where: { id: itemId },
      data: {
        isVerified: result.isVerified,
        verificationScore: Math.round(result.confidence * 100),
        aiFeedback: result.feedback,
        skills: { set: result.tags },
      },
    });
  }
}
