import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AuthService } from './auth/auth.service';

describe('AppController', () => {
  let controller: AppController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getHello should return welcome message', () => {
    expect(controller.getHello()).toBe(
      'Welcome to the NestJS APIs Starter Project🥹!',
    );
  });

  it('login should delegate to AuthService and wrap response', async () => {
    const payload = { access_token: 'token' };
    (authService.login as jest.Mock).mockResolvedValue(payload);

    const req = { user: { id: 1, email: 'john@example.com' } } as any;
    const result = await controller.login(req);

    expect(authService.login).toHaveBeenCalledWith(req.user);
    expect(result).toEqual({
      statusCode: 200,
      message: ['User logged in successfully.'],
      data: payload,
    });
  });
});
