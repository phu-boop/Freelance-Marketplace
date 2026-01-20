import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class WorkspaceAiService {
    private readonly logger = new Logger(WorkspaceAiService.name);
    private genAI: GoogleGenerativeAI;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
        } else {
            this.logger.warn('GEMINI_API_KEY not found. AI features will be mocked.');
        }
    }

    async analyzeRequirements(content: string) {
        if (!this.genAI || !content) {
            return {
                summary: 'AI Service unavailable or content empty.',
                suggestedSpecs: [],
            };
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
      You are a technical project manager. 
      Analyze the following project workspace content (rough notes, requirements, discussion) and:
      1. Provide a concise executive summary.
      2. Transform the notes into a list of formal technical specifications or deliverables.
      
      Content:
      "${content}"
      
      Return EXCLUSIVELY a JSON object:
      {
        "summary": "...",
        "suggestedSpecs": ["Spec 1", "Spec 2", ...]
      }
    `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{.*\}/s);
            const cleanJson = jsonMatch ? jsonMatch[0] : text;

            return JSON.parse(cleanJson);
        } catch (error) {
            this.logger.error(`Gemini Error in analyzeRequirements: ${error.message}`);
            return {
                summary: 'Failed to analyze requirements.',
                suggestedSpecs: [],
            };
        }
    }

    async checkTone(content: string) {
        if (!this.genAI || !content) {
            return { isProfessional: true, suggestions: [] };
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
      Analyze the following text from a professional freelance workspace for tone and professionalism.
      If the tone is aggressive, unprofessional, or contains potentially harmful language, flag it.
      Provide suggestions to make it more professional and collaborative.
      
      Text:
      "${content}"
      
      Return EXCLUSIVELY a JSON object:
      {
        "isProfessional": boolean,
        "toneRating": "PRO", "NEUTRAL", "UNPROFESSIONAL",
        "suggestions": ["Suggestion 1", "Suggestion 2", ...]
      }
    `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{.*\}/s);
            const cleanJson = jsonMatch ? jsonMatch[0] : text;

            return JSON.parse(cleanJson);
        } catch (error) {
            this.logger.error(`Gemini Error in checkTone: ${error.message}`);
            return { isProfessional: true, suggestions: ['Error analyzing tone.'] };
        }
    }
}
