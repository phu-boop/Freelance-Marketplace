import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AiScopingService {
    private readonly logger = new Logger(AiScopingService.name);

    constructor(private httpService: HttpService) { }

    /**
     * Generates a project scope (milestones, skills, budget) from a description or URL.
     * In a real implementation, this would call an LLM (e.g., OpenAI, Claude).
     */
    async generateScope(input: { text?: string; url?: string }) {
        // 1. If URL, scrape content (simulated)
        let content = input.text || '';
        if (input.url) {
            // content = await this.scrapeUrl(input.url);
            this.logger.log(`Analyzing URL: ${input.url}`);
            content += " (Content from URL)";
        }

        // 2. Mock AI Logic: Detect keywords to generate milestones
        const milestones: { title: string; budget: number; description: string }[] = [];
        let estimatedBudget = 500;
        const recommendedSkills = ['Communication'];

        const lower = content.toLowerCase();

        if (lower.includes('mobile') || lower.includes('app') || lower.includes('ios')) {
            milestones.push({ title: 'UI/UX Design', budget: 500, description: 'Wireframes and high-fidelity mockups' });
            milestones.push({ title: 'Frontend Development', budget: 1500, description: 'React Native / Flutter implementation' });
            milestones.push({ title: 'Backend API', budget: 1000, description: 'REST API and Database setup' });
            estimatedBudget = 3000;
            recommendedSkills.push('React Native', 'iOS', 'Android');
        } else if (lower.includes('website') || lower.includes('landing page')) {
            milestones.push({ title: 'Design & Copy', budget: 200, description: 'Figma design and copywriting' });
            milestones.push({ title: 'Development', budget: 600, description: 'Next.js / Tailwind impl' });
            estimatedBudget = 800;
            recommendedSkills.push('React', 'Next.js', 'Tailwind CSS');
        } else {
            // Generic Fallback
            milestones.push({ title: 'Phase 1: Research & Planning', budget: estimatedBudget * 0.2, description: 'Initial requirements gathering' });
            milestones.push({ title: 'Phase 2: Execution', budget: estimatedBudget * 0.8, description: 'Core deliverables' });
        }

        return {
            milestones,
            estimatedBudget: { min: estimatedBudget * 0.8, max: estimatedBudget * 1.2 },
            recommendedSkills,
            techStack: recommendedSkills.slice(1) // Just valid techs
        };
    }
}
