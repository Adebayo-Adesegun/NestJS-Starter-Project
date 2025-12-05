import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { AccountLockoutService } from './account-lockout.service';
import { AuditLoggerService } from '../common/audit/audit-logger.service';

describe('Auth Password Flows', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            sendPasswordReset: jest.fn(),
            resetPassword: jest.fn(),
            changePassword: jest.fn(),
          },
        },
        { provide: UserService, useValue: {} },
        {
          provide: AccountLockoutService,
          useValue: {},
        },
        {
          provide: AuditLoggerService,
          useValue: {
            logPasswordResetRequested: jest.fn(),
            logPasswordResetSuccess: jest.fn(),
            logPasswordResetFailure: jest.fn(),
            logPasswordResetTokenUsed: jest.fn(),
            logPasswordChangeRequested: jest.fn(),
            logPasswordChangeSuccess: jest.fn(),
            logPasswordChangeFailure: jest.fn(),
            logRateLimitExceeded: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('forgotPassword should call sendPasswordReset and return generic message', async () => {
    const dto = { email: 'test@example.com' } as any;
    (authService.sendPasswordReset as jest.Mock).mockResolvedValue(undefined);

    const req = { ip: '127.0.0.1', headers: {} } as any;
    const res = await controller.forgotPassword(dto, req);

    expect(authService.sendPasswordReset).toHaveBeenCalledWith(dto.email);
    expect(res).toHaveProperty('statusCode', 200);
    expect(res.message[0]).toContain('If an account exists');
  });

  it('resetPassword should call resetPassword and return success message', async () => {
    const dto = { token: 'tok', newPassword: 'StrongPass123!' } as any;
    (authService.resetPassword as jest.Mock).mockResolvedValue(undefined);

    const res = await controller.resetPassword(dto);

    expect(authService.resetPassword).toHaveBeenCalledWith(
      dto.token,
      dto.newPassword,
    );
    expect(res).toHaveProperty('statusCode', 200);
  });

  it('changePassword should call changePassword with resolved user id', async () => {
    const dto = {
      currentPassword: 'old',
      newPassword: 'NewStrongPass!123',
    } as any;
    (authService.changePassword as jest.Mock).mockResolvedValue(undefined);

    const req = { user: { id: 42 } } as any;
    const res = await controller.changePassword(req, dto);

    expect(authService.changePassword).toHaveBeenCalledWith(
      42,
      dto.currentPassword,
      dto.newPassword,
    );
    expect(res).toHaveProperty('statusCode', 200);
  });
});
