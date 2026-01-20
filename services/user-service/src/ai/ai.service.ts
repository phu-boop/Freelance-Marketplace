import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private genAI: GoogleGenerativeAI;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
        } else {
            this.logger.warn('GEMINI_API_KEY not found in environment variables.');
        }
    }

    async generateProposalContent(jobDescription: string, freelancerBio: string, tone: string = 'professional') {
        if (!this.genAI) throw new Error('AI Service not initialized');

        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      You are an expert freelance proposal writer.
      Target Tone: ${tone}
      
      Job Description:
      "${jobDescription}"
      
      Freelancer Biography/Profile:
      "${freelancerBio}"
      
      Write a compelling, concise cover letter for this job. 
      Focus on how the freelancer's specific experience matches the job requirements.
      Keep it under 300 words. Format with proper professional structure.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }

    async analyzeJobScoping(jobDescription: string) {
        if (!this.genAI) throw new Error('AI Service not initialized');

        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      Analyze the following job description and break it down into clear, measurable milestones with estimated efforts.
      Return the result as a JSON array of objects with 'title', 'description', and 'estimatedHours' fields.
      
      Job Description:
      "${jobDescription}"
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Simple JSON extraction from markdown if needed
        if (text.includes('```json')) {
            text = text.split('```json')[1].split('```')[0];
        } else if (text.includes('```')) {
            text = text.split('```')[1].split('```')[0];
        }

        try {
            return JSON.parse(text);
        } catch (e) {
            this.logger.error('Failed to parse AI JSON response', e);
            return { raw: text };
        }
    }

    async generateSkillAssessment(skill: string) {
        if (!this.genAI) throw new Error('AI Service not initialized');

        const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Generate 5 sophisticated multiple-choice questions to test professional proficiency in "${skill}".
            Each question must have:
            - question: The question text (should be practical/scenario-based)
            - options: Array of 4 strings
            - correctIndex: Index of the correct option (0-3)
            - difficulty: "BASIC", "INTERMEDIATE", or "ADVANCED"
            
            Return the result as a raw JSON array of these objects.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Extract JSON
        if (text.includes('```json')) {
            text = text.split('```json')[1].split('```')[0];
        } else if (text.includes('```')) {
            text = text.split('```')[1].split('```')[0];
        }

        try {
            return JSON.parse(text);
        } catch (e) {
            this.logger.error('Failed to parse AI JSON response for assessment', e);
            throw new Error('AI failed to generate valid assessment questions');
        }
    }
}
