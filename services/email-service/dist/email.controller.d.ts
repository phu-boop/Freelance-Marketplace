import { EmailService } from './email.service';
export declare class EmailController {
    private readonly emailService;
    constructor(emailService: EmailService);
    sendEmail(body: {
        to: string;
        subject: string;
        text: string;
    }): Promise<{
        success: boolean;
    }>;
}
