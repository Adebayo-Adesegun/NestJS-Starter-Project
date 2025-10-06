import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { MailService } from './mailer.service';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

describe('MailService', () => {
  let service: MailService;
  let mailer: { sendMail: jest.Mock };

  beforeEach(async () => {
    // Mock Logger to avoid real logging in tests
    const logSpy = jest.spyOn(Logger.prototype, 'log');
    logSpy.mockImplementation(() => undefined);
    const errorSpy = jest.spyOn(Logger.prototype, 'error');
    errorSpy.mockImplementation(() => undefined);

    mailer = { sendMail: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: NestMailerService, useValue: mailer },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call underlying mailer with expected args and return result', async () => {
    const result = { messageId: 'abc123' };
    mailer.sendMail.mockResolvedValue(result);

    const res = await service.send({
      to: 'user@example.com',
      subject: 'Test',
      text: 'Hello',
      template: 'generic',
      context: { title: 'T', message: 'Hi' },
    });

    expect(mailer.sendMail).toHaveBeenCalledTimes(1);
    expect(mailer.sendMail).toHaveBeenCalledWith({
      to: 'user@example.com',
      subject: 'Test',
      text: 'Hello',
      template: 'generic',
      context: { title: 'T', message: 'Hi' },
    });
    expect(res).toBe(result);
  });

  it('should propagate errors from the underlying mailer', async () => {
    const err = new Error('SMTP down');
    mailer.sendMail.mockRejectedValue(err);

    await expect(
      service.send({
        to: 'user@example.com',
        subject: 'Test',
      }),
    ).rejects.toThrow('SMTP down');
  });
});
