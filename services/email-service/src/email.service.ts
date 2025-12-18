import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST', 'localhost'),
            port: parseInt(this.configService.get('SMTP_PORT', '1025')),
            ignoreTLS: true,
        });
    }

    async sendEmail(to: string, subject: string, text: string) {
        const info = await this.transporter.sendMail({
            from: '"Freelance Marketplace" <no-reply@freelance.com>',
            to,
            subject,
            text,
        });
        console.log('Message sent: %s', info.messageId);
        return info;
    }
}
