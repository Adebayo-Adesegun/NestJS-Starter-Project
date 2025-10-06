import { Test, TestingModule } from '@nestjs/testing';
import { MailController } from './mailer.controller';
import { MailService } from './mailer.service';

describe('MailController', () => {
  let controller: MailController;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailController],
      providers: [
        {
          provide: MailService,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MailController>(MailController);
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should send mail with defaults and return response', async () => {
    (mailService.send as jest.Mock).mockResolvedValue({ messageId: 'abc-123' });

    const dto = {
      to: 'john@example.com',
      subject: 'Hi',
      text: 'Hello',
      // template and context omitted to use defaults
    } as any;

    const result = await controller.send(dto);
    expect(mailService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: dto.to,
        subject: dto.subject,
        text: dto.text,
        template: 'generic',
      }),
    );
    expect(result).toEqual({
      statusCode: 200,
      message: 'Mail sent',
      data: { messageId: 'abc-123' },
    });
  });
});
