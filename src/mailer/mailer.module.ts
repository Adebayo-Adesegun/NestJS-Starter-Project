import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import mailConfig from 'src/config/mail.config';
import { MailService } from './mailer.service';
import { MailController } from './mailer.controller';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forFeature(mailConfig),
    NestMailerModule.forRootAsync({
      imports: [ConfigModule.forFeature(mailConfig)],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const cfg = configService.get('mail');
        const templatePath = cfg?.templatePath || join(__dirname, 'templates');
        return {
          transport: cfg?.transport,
          defaults: {
            from: cfg?.from,
          },
          preview: cfg?.preview,
          template: {
            dir: templatePath,
            adapter: new HandlebarsAdapter(),
            options: {
              strict: false,
            },
          },
        };
      },
    }),
  ],
  providers: [MailService],
  controllers: [MailController],
  exports: [MailService],
})
export class MailerModule {}
