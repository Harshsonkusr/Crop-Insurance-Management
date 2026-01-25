import nodemailer from 'nodemailer';
import { Logger } from '../utils/logger';

export class EmailService {
    private static transporter: nodemailer.Transporter;

    static async initialize() {
        if (this.transporter) return;

        if (process.env.SMTP_HOST && process.env.SMTP_USER) {
            // Production / Custom SMTP
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            Logger.system.start('Email Service initialized with Custom SMTP');
        } else {
            // Development: Use Ethereal or JSON Transport
            try {
                const testAccount = await nodemailer.createTestAccount();
                this.transporter = nodemailer.createTransport({
                    host: testAccount.smtp.host,
                    port: testAccount.smtp.port,
                    secure: testAccount.smtp.secure,
                    auth: {
                        user: testAccount.user,
                        pass: testAccount.pass
                    }
                });
                Logger.system.start('Email Service initialized with Ethereal (Dev Mode)');
                Logger.info(`Ethereal Credentials: ${testAccount.user} / ${testAccount.pass}`);
            } catch (err) {
                Logger.warn('Failed to create Ethereal account, falling back to JSON transport');
                this.transporter = nodemailer.createTransport({
                    jsonTransport: true
                });
            }
        }
    }

    static async sendEmail(to: string, subject: string, html: string, text?: string) {
        if (!this.transporter) await this.initialize();

        try {
            const info = await this.transporter.sendMail({
                from: process.env.SMTP_FROM || '"Crop Insurance System" <noreply@cropinsurance.gov.in>',
                to,
                subject,
                html,
                text: text || html.replace(/<[^>]*>?/gm, ''), // Basic strip tags
            });

            Logger.info(`Email sent to ${to}`, { messageId: info.messageId });

            // If using Ethereal, log the preview URL
            const previewUrl = nodemailer.getTestMessageUrl(info);
            if (previewUrl) {
                Logger.info(`📧 Email Preview URL: ${previewUrl}`);
                console.log(`\n\n[DEV EMAIL PREVIEW]: ${previewUrl}\n\n`);
            }

            return info;
        } catch (error: any) {
            Logger.error('Failed to send email', { error: error.message, to });
            // Don't throw, just log
            return null;
        }
    }
}
