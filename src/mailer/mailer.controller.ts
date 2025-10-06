import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { MailService } from './mailer.service';
import { SendMailDto } from './dto/send-mail.dto';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Throttle({ default: { limit: 3, ttl: 60 } })
  @Post('send')
  async send(@Body() body: SendMailDto) {
    const template = body.template || 'generic';
    const context = body.context || { title: 'Hello', message: 'Welcome!' };
    const result = await this.mailService.send({
      to: body.to,
      subject: body.subject,
      text: body.text,
      template,
      context,
    });
    return {
      statusCode: 200,
      message: 'Mail sent',
      data: { messageId: result?.messageId ?? undefined },
    };
  }
}
