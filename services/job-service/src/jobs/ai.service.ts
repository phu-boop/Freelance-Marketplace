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

    async generateProposal(jobId: string, userId: string, tone: string = 'professional') {
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

        const model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const portfolioItems = userProfile?.portfolio || [];
        const portfolioContext = portfolioItems.map((item: any, index: number) =>
            `Portfolio Item ${index + 1}: ID=${item.id}, Title=${item.title}, Description=${item.description}`
        ).join('\n');

        const prompt = `
      You are a professional freelancer on a marketplace. 
      Write a compelling job proposal for the following job.
      Use a ${tone} tone.
      
      Job Title: ${job.title}
      Job Description: ${job.description}
      Category: ${job.category?.name}
      Required Skills: ${job.skills.map(s => s.skill.name).join(', ')}
      
      Freelancer Name: ${userProfile?.firstName} ${userProfile?.lastName}
      Freelancer Skills: ${userProfile?.skills?.join(', ') || 'N/A'}
      Freelancer Bio: ${userProfile?.overview || 'N/A'}
      
      Portfolio Items Available:
      ${portfolioContext || 'None'}

      Instructions:
      1. Be professional and persuasive.
      2. Highlight relevant skills and experience.
      3. Keep it concise (3-4 paragraphs).
      4. Select top 2-3 most relevant Portfolio Item IDs if any exist.
      5. Use a friendly yet professional tone.
      6. Don't use placeholders like [Your Name], use the provided name.
      7. Suggest a competitive bid amount based on the job details and freelancer profile.
      
      Return the result EXCLUSIVELY as a JSON object:
      {
        "content": "The proposal cover letter text",
        "recommendedPortfolioIds": ["id1", "id2"],
        "suggestedBid": number (a suggested bid amount in USD)
      }
    `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extract JSON if there's markdown fluff
            const jsonMatch = text.match(/\{.*\}/s);
            const cleanJson = jsonMatch ? jsonMatch[0] : text;
            const parsed = JSON.parse(cleanJson);

            return {
                content: parsed.content,
                recommendedPortfolioIds: parsed.recommendedPortfolioIds || [],
                suggestedBid: parsed.suggestedBid || job.budget
            };
        } catch (error) {
            this.logger.error(`Gemini Error: ${error.message}`);
            return this.mockProposal(job, userProfile);
        }
    }

    async generateMilestones(description: string, budget?: number) {
        if (!this.genAI) {
            return this.mockMilestones(budget);
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

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

    async scrapeProjectFromText(content: string) {
        if (!this.genAI || !content) {
            return {
                title: '',
                description: 'AI service unavailable or content empty.',
                skills: [],
                milestones: [],
            };
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const prompt = `
      You are an expert technical project manager and recruiter. 
      Analyze the following raw text (notes, requirements, or document content) and extract a formal job post structure.
      
      Content:
      "${content}"
      
      Return EXCLUSIVELY a JSON object:
      {
        "title": "A concise, professional job title",
        "description": "A well-structured job description",
        "skills": ["Skill 1", "Skill 2", ...],
        "milestones": [
          { "title": "Milestone 1", "description": "...", "percentage": 25 },
          ...
        ]
      }
      
      Instructions:
      1. Milestones percentages must sum to 100.
      2. Extract 3-7 key technical skills.
      3. The description should be professional and clear.
    `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{.*\}/s);
            const cleanJson = jsonMatch ? jsonMatch[0] : text;

            return JSON.parse(cleanJson);
        } catch (error) {
            this.logger.error(`Gemini Error in scrapeProject: ${error.message}`);
            return {
                title: 'Error Scraping Project',
                description: 'Failed to parse content.',
                skills: [],
                milestones: [],
            };
        }
    }

    async estimateBudgetComplexity(description: string) {
        if (!this.genAI || !description) {
            return { complexity: 'Low', suggestedRange: '$500 - $1,000', confidence: 0.5 };
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const prompt = `
      Analyze the professional complexity of the following job description.
      Estimate a fair market budget range and provide a complexity rating (Low, Medium, High).
      
      Job Description:
      "${description}"
      
      Return EXCLUSIVELY a JSON object:
      {
        "complexity": "Low" | "Medium" | "High",
        "suggestedRange": "$Min - $Max",
        "reasoning": "A short sentence explaining the rating",
        "confidence": number (0.0 to 1.0)
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
            this.logger.error(`Gemini Error in budget estimation: ${error.message}`);
            return { complexity: 'Medium', suggestedRange: '$1,000 - $3,000', confidence: 0.3 };
        }
    }

    async analyzeCommunicationStyle(messages: string[]) {
        if (!this.genAI || messages.length === 0) {
            return 'Proactive'; // Default
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

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

    async scanSubmission(content: string) {
        if (!this.genAI || !content) {
            return { isSafe: true, report: "Submission too short or AI service unavailable." };
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const prompt = `
      You are a senior code reviewer and security auditor.
      Analyze the following work submission content for:
      1. Potential security vulnerabilities (exposed secrets, SQL injection patterns, etc.)
      2. Performance bottlenecks.
      3. Quality issues.
      
      Submission Content:
      "${content}"
      
      Return EXCLUSIVELY a JSON object:
      {
        "isSafe": boolean,
        "riskLevel": "LOW" | "MEDIUM" | "HIGH",
        "report": "A concise summary of findings or 'No major issues found'."
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
            this.logger.error(`Gemini Error in scanSubmission: ${error.message}`);
            return { isSafe: true, riskLevel: "LOW", report: "AI analysis failed." };
        }
    }

    async generateDailyStandup(contractId: string, messages: string[]) {
        if (!this.genAI || messages.length === 0) {
            return { summary: "No recent activity recorded for today." };
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const history = messages.join('\n');
        const prompt = `
      You are an AI project assistant. 
      Summarize the following recent project communication into a concise "Daily Standup" update.
      Focus on progress made, blockers mentioned, and next steps.
      
      Communication History:
      ${history}
      
      Instructions:
      1. Structure the response into "What was accomplished", "Blockers/Risks", and "Next Steps".
      2. Keep it professional and brief (max 200 words).
      3. Use bullet points for clarity.
      4. If no clear progress is found, state that "Coordination is ongoing".
      
      Return as a JSON object:
      {
        "summary": "The structured standup update text (markdown format)"
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
            this.logger.error(`Gemini Error in daily standup: ${error.message}`);
            return { summary: "Daily update is temporarily unavailable." };
        }
    }

    async detectFraud(content: string) {
        const isDummyKey = this.configService.get<string>('GEMINI_API_KEY') === 'YOUR_GEMINI_API_KEY_HERE';
        if (!this.genAI || !content || isDummyKey) {
            return this.mockDetectFraud(content);
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

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

    async analyzeDispute(disputeId: string, context: {
        contractTitle: string;
        milestoneDescription: string;
        claimPercentage: number;
        messages: string[];
    }) {
        if (!this.genAI) {
            return {
                summary: "(Mocked) Dispute analysis suggests a 50/50 split. Both parties claim fulfillment but lack definitive evidence of the specific deliverable requirements being missed.",
                suggestedFreelancerPercentage: 50,
                confidenceRating: 0.7
            };
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const history = context.messages.slice(-10).join('\n'); // Last 10 messages for context
        const prompt = `
      You are an AI arbitrator for a professional freelance marketplace. 
      Analyze the following dispute context and provide a neutral, fair settlement recommendation.
      
      CONTRACT: ${context.contractTitle}
      MILESTONE: ${context.milestoneDescription}
      FREELANCER CLAIM: ${context.claimPercentage}% of the milestone amount
      
      RECENT COMMUNICATION HISTORY:
      ${history}
      
      INSTRUCTIONS:
      1. Evaluate the tone, responsiveness, and evidence mentioned in the chat.
      2. provide a concise (2-3 sentence) summary of your findings.
      3. Suggest a settlement percentage for the Freelancer (0-100).
      
      Return as a JSON object:
      {
        "summary": "The justification for the recommendation",
        "suggestedFreelancerPercentage": number,
        "confidenceRating": number (0.0 to 1.0)
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
            this.logger.error(`Gemini Error in dispute analysis: ${error.message}`);
            return {
                summary: "Dispute analysis is temporarily unavailable.",
                suggestedFreelancerPercentage: 50,
                confidenceRating: 0.5
            };
        }
    }

    async updateProposalAiAnalysis(proposalId: string): Promise<void> {
        // This method was declared in the instruction but no implementation was provided.
        // Adding a placeholder implementation to avoid compilation errors.
        // If this method is intended to be part of the AiService, its full implementation
        // should be provided.
        this.logger.warn(`updateProposalAiAnalysis for proposal ${proposalId} called but not implemented.`);
        return;
    }

    async autoScreenProposal(proposalId: string) {
        const proposal = await this.prisma.proposal.findUnique({
            where: { id: proposalId },
            include: { job: { include: { skills: { include: { skill: true } } } } },
        });

        if (!proposal) {
            this.logger.error(`Proposal ${proposalId} not found for AI screening`);
            return;
        }

        const job = proposal.job;
        let freelancerProfile: any = null;
        try {
            const userServiceUrl = this.configService.get<string>('USER_SERVICE_INTERNAL_URL', 'http://user-service:3000/api/users');
            const { data } = await firstValueFrom(
                this.httpService.get(`${userServiceUrl}/${proposal.freelancerId}`)
            );
            freelancerProfile = data;
        } catch (error) {
            this.logger.error(`Failed to fetch freelancer profile ${proposal.freelancerId}: ${error.message}`);
        }

        if (!this.genAI) {
            const mock = this.mockScreening(job, proposal, freelancerProfile);
            await this.prisma.proposal.update({
                where: { id: proposalId },
                data: mock,
            });
            return;
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const specializedProfile = (freelancerProfile?.specializedProfiles || []).find(sp => sp.id === proposal.specializedProfileId) || (freelancerProfile?.specializedProfiles?.[0]);

        const prompt = `
      You are an AI recruiter for a high-end freelance marketplace.
      Analyze the following job and proposal to determine the match quality score (0-100).
      
      JOB:
      Title: ${job.title}
      Description: ${job.description}
      Required Skills: ${job.skills.map(s => s.skill.name).join(', ')}
      Preferred Style: ${job.preferredCommunicationStyle || 'Not specified'}
      
      FREELANCER PROFILE:
      Name: ${freelancerProfile?.firstName} ${freelancerProfile?.lastName}
      General Title: ${freelancerProfile?.title || 'N/A'}
      General Score: ${freelancerProfile?.jobSuccessScore}% JSS
      General Skills: ${freelancerProfile?.skills?.join(', ') || 'N/A'}
      
      SPECIALIZED PROFILE (Matched):
      Title: ${specializedProfile?.title || 'None'}
      Overview: ${specializedProfile?.overview || 'None'}
      Skills: ${specializedProfile?.skills?.join(', ') || 'None'}
      
      PROPOSAL:
      Cover Letter: ${proposal.coverLetter}
      Bid Amount: $${proposal.bidAmount}
      Timeline: ${proposal.timeline}
      Screening Answers: ${JSON.stringify(proposal.screeningAnswers || {})}
      
      SCORING RULES:
      1. 80-100: "Strong Match" - Freelancer has a specialized profile directly aligned with the job, matching skills, high JSS, and a tailored proposal with clear screening answers.
      2. 50-79: "Potential" - Freelancer has relevant skills but maybe lacks a specific specialized profile match or the proposal is generic.
      3. 0-49: "Weak Match" - Poor skill overlap, generic proposal, or unsatisfactory answers to screening questions.

      Return the result EXCLUSIVELY as a JSON object:
      {
        "aiScore": number,
        "aiAnalysis": "A 2-3 sentence technical justification highlighting specific strengths or missing requirements."
      }
    `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{.*\}/s);
            const cleanJson = jsonMatch ? jsonMatch[0] : text;
            const screeningData = JSON.parse(cleanJson);

            await this.prisma.proposal.update({
                where: { id: proposalId },
                data: {
                    aiScore: screeningData.aiScore,
                    aiAnalysis: screeningData.aiAnalysis,
                },
            });
        } catch (error) {
            this.logger.error(`Gemini Error in auto-screening: ${error.message}`);
            const mock = this.mockScreening(job, proposal, freelancerProfile);
            await this.prisma.proposal.update({
                where: { id: proposalId },
                data: mock,
            });
        }
    }

    private mockScreening(job: any, proposal: any, user: any) {
        // Simple logic: if user has some of the job skills, score is higher
        const jobSkills = job.skills.map(s => s.skill.name.toLowerCase());
        const userSkills = (user?.skills || []).map(s => s.toLowerCase());
        const overlap = jobSkills.filter(s => userSkills.includes(s));

        let score = 50; // default
        if (overlap.length > 0) score += (overlap.length / jobSkills.length) * 40;
        if (proposal.coverLetter.length > 100) score += 10;

        return {
            aiScore: Math.round(Math.min(100, score)),
            aiAnalysis: `(Mocked) Good fit based on ${overlap.length} matching skills. The cover letter is detailed.`,
        };
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

        return { isFlagged: false, reason: '' };
    }

    async scanChatForRisks(messages: string[]): Promise<{ riskScore: number; reason: string; isFlagged: boolean }> {
        if (!this.genAI) {
            const mock = this.mockDetectFraud(messages.join(' '));
            return {
                riskScore: mock.isFlagged ? 90 : 0,
                reason: mock.reason,
                isFlagged: mock.isFlagged
            };
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        const chatLog = messages.join('\n');

        const prompt = `
      Analyze the following chat log between a freelancer and a client on a professional marketplace.
      Detect any of the following risks:
      1. Off-platform payment requests (PayPal, Bank Transfer, Crypto direct, etc.).
      2. Sharing contact info (WhatsApp, Telegram, Phone, Email) before a contract is started.
      3. Asking for account credentials or sensitive personal information.
      4. Professional misconduct or harassment.

      CHAT LOG:
      ${chatLog}

      Return the result EXCLUSIVELY as a JSON object:
      {
        "riskScore": number (0-100),
        "reason": "Short explanation of the risk",
        "isFlagged": boolean
      }
    `;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{.*\}/s);
            const cleanJson = jsonMatch ? jsonMatch[0] : text;
            const data = JSON.parse(cleanJson);

            return {
                riskScore: data.riskScore || 0,
                reason: data.reason || 'Safe',
                isFlagged: data.isFlagged || (data.riskScore > 70)
            };
        } catch (error) {
            this.logger.error(`Gemini Error in chat scanning: ${error.message}`);
            const mock = this.mockDetectFraud(chatLog);
            return {
                riskScore: mock.isFlagged ? 90 : 10,
                reason: mock.reason || 'Low risk (mocked)',
                isFlagged: mock.isFlagged
            };
        }
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
            recommendedPortfolioIds: user?.portfolio?.slice(0, 2).map((p: any) => p.id) || [],
            isMock: true
        };
    }
}
