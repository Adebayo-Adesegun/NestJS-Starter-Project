import { Injectable, Logger } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

interface SendOptions {
  to: string;
  subject: string;
  text?: string;
  template?: string;
  context?: Record<string, any>;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailer: NestMailerService) {}

  async send(options: SendOptions) {
    const { to, subject, text, template, context } = options;
    try {
      const res = await this.mailer.sendMail({
        to,
        subject,
        text,
        template,
        context,
      });
      this.logger.log(`Mail sent to ${to} with subject: ${subject}`);
      return res;
    } catch (error) {
      this.logger.error(`Failed to send mail to ${to}: ${error?.message}`);
      throw error;
    }
  }
}
