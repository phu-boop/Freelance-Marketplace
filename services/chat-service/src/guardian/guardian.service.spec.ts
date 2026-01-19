import { Test, TestingModule } from '@nestjs/testing';
import { GuardianService } from './guardian.service';

describe('GuardianService', () => {
    let service: GuardianService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GuardianService],
        }).compile();

        service = module.get<GuardianService>(GuardianService);
    });

    it('should detect payment keywords', () => {
        const result = service.analyzeContent('Please pay me via paypal', 'user1');
        expect(result.flags).toContain('PAYMENT_KEYWORD_DETECTED');
        expect(result.riskScore).toBeGreaterThan(0);
    });

    it('should detect off-platform communication keywords', () => {
        const result = service.analyzeContent('Contact me on whatsapp', 'user1');
        expect(result.flags).toContain('OFF_PLATFORM_COMM_DETECTED');
        expect(result.riskScore).toBeGreaterThan(0);
    });

    it('should detect emails', () => {
        const result = service.analyzeContent('My email is test@example.com', 'user1');
        expect(result.flags).toContain('EMAIL_DETECTED');
    });

    it("should detect circumvention intent", () => {
        const result = service.analyzeContent("Let's pay outside to avoid fees", "user1");
        expect(result.flags).toContain("CIRCUMVENTION_INTENT");
        expect(result.riskScore).toBe(80);
    });

    it('should cap risk score at 100', () => {
        const result = service.analyzeContent('Pay me outside via paypal and whatsapp. My email is test@example.com', 'user1');
        expect(result.riskScore).toBe(100);
    });
});
