import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UnauthorizedException, Logger } from '@nestjs/common';
import { AuditLoggerService } from '../common/audit/audit-logger.service';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mailer/mailer.service';

let authService: AuthService;
let userServiceMock: UserService;
let jwtServiceMock: JwtService;

beforeAll(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      AuthService,
      {
        provide: UserService,
        useValue: {
          validateCredentials: jest.fn(),
          create: jest.fn(),
          findOne: jest.fn(),
          updatePassword: jest.fn(),
        },
      },
      {
        provide: JwtService,
        useValue: {
          signAsync: jest.fn(),
        },
      },
      {
        provide: 'RolesPermissionRepository',
        useValue: {
          find: jest.fn(),
          save: jest.fn(),
        },
      },
      {
        provide: 'PasswordResetTokenRepository',
        useValue: {
          findOne: jest.fn(),
          delete: jest.fn(),
          create: jest.fn(),
          save: jest.fn(),
        },
      },
      {
        provide: AuditLoggerService,
        useValue: {
          log: jest.fn(),
        },
      },
      {
        provide: ConfigService,
        useValue: {
          get: jest.fn(),
        },
      },
      {
        provide: MailService,
        useValue: {
          send: jest.fn(),
        },
      },
    ],
  }).compile();

  authService = module.get<AuthService>(AuthService);
  userServiceMock = module.get<UserService>(UserService);
  jwtServiceMock = module.get<JwtService>(JwtService);
});

describe('validateUser', () => {
  it('should not validate user that does not exist', async () => {
    const email = 'user_reg@mail.com';
    const password = 'password';
    const findOneSpy = jest
      .spyOn(userServiceMock, 'findOne')
      .mockResolvedValue(null);
    await expect(() =>
      authService.validateUser(email, password),
    ).rejects.toThrow(UnauthorizedException);

    findOneSpy.mockReset();
  });

  it('should not validate user with wrong password', async () => {
    const email = 'user_reg@mail.com';
    const password = 'password';
    const checkPasswordSpy = jest
      .spyOn(userServiceMock, 'findOne')
      .mockResolvedValue({ checkPassword: () => false } as any);
    await expect(() =>
      authService.validateUser(email, password),
    ).rejects.toThrow(UnauthorizedException);
    checkPasswordSpy.mockReset();
  });

  it('should validate user with correct password', async () => {
    const email = 'user_reg@mail.com';
    const password = 'password';

    const userMock = {
      email,
      password: 'hashedPassword',
      checkPassword: jest.fn().mockResolvedValue(true),
    };

    const findOneSpy = jest
      .spyOn(userServiceMock, 'findOne')
      .mockResolvedValue(userMock as any);

    const result = await authService.validateUser(email, password);

    expect(result).toHaveProperty('email', email);
    expect(findOneSpy).toBeCalledWith({ where: { email } });
    expect(userMock.checkPassword).toBeCalledWith(password);

    findOneSpy.mockReset();
  });
});

describe('login', () => {
  it('should return user and access token', async () => {
    const userMock = {
      userId: 1,
      firstName: 'Daniel',
      lastName: 'Adeyemi',
      isAdmin: false,
      username: 'daniel-adesegun@mail.com',
    };

    const signAsyncSpy = jest
      .spyOn(jwtServiceMock, 'signAsync')
      .mockResolvedValue('token');

    const result = await authService.login(userMock as any);

    expect(result).toHaveProperty('firstName', userMock.firstName);
    expect(result).toHaveProperty('lastName', userMock.lastName);
    expect(result).toHaveProperty('isAdmin', userMock.isAdmin);
    expect(result).toHaveProperty('access_token', 'token');
    expect(signAsyncSpy).toBeCalledWith({
      username: userMock.username,
      sub: userMock.userId,
    });

    signAsyncSpy.mockReset();
  });
});

describe('sendPasswordReset', () => {
  let passwordResetTokenRepo: any;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    passwordResetTokenRepo = authService['passwordResetTokenRepository'];
    // Suppress Logger.error in tests
    loggerErrorSpy = jest.spyOn(Logger, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    loggerErrorSpy.mockRestore();
  });

  it('should not reveal when user does not exist', async () => {
    jest.spyOn(userServiceMock, 'findOne').mockResolvedValue(null);

    await authService.sendPasswordReset('nonexistent@mail.com');

    expect(userServiceMock.findOne).toHaveBeenCalledWith({
      where: { email: 'nonexistent@mail.com' },
    });
  });

  it('should create token and send email when user exists', async () => {
    const mockUser = { id: 1, email: 'user@mail.com', firstName: 'John' };
    const configService = authService['configService'];
    const mailService = authService['mailService'];

    jest.spyOn(userServiceMock, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(passwordResetTokenRepo, 'delete').mockResolvedValue({});
    jest.spyOn(passwordResetTokenRepo, 'create').mockReturnValue({});
    jest.spyOn(passwordResetTokenRepo, 'save').mockResolvedValue({});
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'PASSWORD_RESET_EXPIRES_IN') return '60';
      if (key === 'FRONTEND_URL') return 'http://localhost:3000';
      return null;
    });
    jest.spyOn(mailService, 'send').mockResolvedValue(true as any);

    await authService.sendPasswordReset('user@mail.com');

    expect(passwordResetTokenRepo.delete).toHaveBeenCalledWith({
      userId: 1,
      used: false,
    });
    expect(passwordResetTokenRepo.create).toHaveBeenCalled();
    expect(passwordResetTokenRepo.save).toHaveBeenCalled();
    expect(mailService.send).toHaveBeenCalled();
  });

  it('should handle email sending failure gracefully', async () => {
    const mockUser = { id: 1, email: 'user@mail.com', firstName: 'John' };
    const mailService = authService['mailService'];

    jest.spyOn(userServiceMock, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(passwordResetTokenRepo, 'delete').mockResolvedValue({});
    jest.spyOn(passwordResetTokenRepo, 'create').mockReturnValue({});
    jest.spyOn(passwordResetTokenRepo, 'save').mockResolvedValue({});
    jest.spyOn(mailService, 'send').mockRejectedValue(new Error('SMTP failed'));

    await expect(
      authService.sendPasswordReset('user@mail.com'),
    ).resolves.not.toThrow();
  });
});
describe('resetPassword', () => {
  let passwordResetTokenRepo: any;

  beforeEach(() => {
    passwordResetTokenRepo = authService['passwordResetTokenRepository'];
  });

  it('should throw error for invalid token', async () => {
    jest.spyOn(passwordResetTokenRepo, 'findOne').mockResolvedValue(null);

    await expect(
      authService.resetPassword('invalid-token', 'NewPass123!'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw error for expired token', async () => {
    const expiredToken = {
      expiresAt: new Date(Date.now() - 10000),
      used: false,
    };
    jest
      .spyOn(passwordResetTokenRepo, 'findOne')
      .mockResolvedValue(expiredToken);

    await expect(
      authService.resetPassword('expired-token', 'NewPass123!'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw error for already used token', async () => {
    const usedToken = {
      expiresAt: new Date(Date.now() + 10000),
      used: true,
      user: { id: 1 },
    };
    jest.spyOn(passwordResetTokenRepo, 'findOne').mockResolvedValue(usedToken);

    await expect(
      authService.resetPassword('used-token', 'NewPass123!'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw error for weak password', async () => {
    const validToken = {
      expiresAt: new Date(Date.now() + 10000),
      used: false,
      user: { id: 1 },
    };
    jest.spyOn(passwordResetTokenRepo, 'findOne').mockResolvedValue(validToken);

    await expect(
      authService.resetPassword('valid-token', 'weak'),
    ).rejects.toThrow();
  });

  it('should throw error when user not found on token', async () => {
    const tokenWithoutUser = {
      expiresAt: new Date(Date.now() + 10000),
      used: false,
      user: null,
    };
    jest
      .spyOn(passwordResetTokenRepo, 'findOne')
      .mockResolvedValue(tokenWithoutUser);

    await expect(
      authService.resetPassword('token', 'NewPass123!@#'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should successfully reset password with valid token', async () => {
    const validToken = {
      expiresAt: new Date(Date.now() + 10000),
      used: false,
      user: { id: 1, email: 'user@mail.com' },
    };
    jest.spyOn(passwordResetTokenRepo, 'findOne').mockResolvedValue(validToken);
    jest.spyOn(userServiceMock, 'updatePassword').mockResolvedValue(undefined);
    jest.spyOn(passwordResetTokenRepo, 'save').mockResolvedValue({});

    await authService.resetPassword('valid-token', 'NewPass123!@#');

    expect(userServiceMock.updatePassword).toHaveBeenCalledWith(
      1,
      'NewPass123!@#',
    );
    expect(passwordResetTokenRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ used: true }),
    );
  });
});

describe('changePassword', () => {
  it('should throw error when user not found', async () => {
    jest.spyOn(userServiceMock, 'findOne').mockResolvedValue(null);

    await expect(
      authService.changePassword(1, 'OldPass123!', 'NewPass123!'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw error when current password is incorrect', async () => {
    const mockUser = {
      id: 1,
      checkPassword: jest.fn().mockResolvedValue(false),
    };
    jest.spyOn(userServiceMock, 'findOne').mockResolvedValue(mockUser as any);

    await expect(
      authService.changePassword(1, 'WrongPass123!', 'NewPass123!'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw error when new password is weak', async () => {
    const mockUser = {
      id: 1,
      checkPassword: jest.fn().mockResolvedValue(true),
    };
    jest.spyOn(userServiceMock, 'findOne').mockResolvedValue(mockUser as any);

    await expect(
      authService.changePassword(1, 'OldPass123!', 'weak'),
    ).rejects.toThrow();
  });

  it('should successfully change password', async () => {
    const mockUser = {
      id: 1,
      email: 'user@mail.com',
      checkPassword: jest.fn().mockResolvedValue(true),
    };
    jest.spyOn(userServiceMock, 'findOne').mockResolvedValue(mockUser as any);
    jest.spyOn(userServiceMock, 'updatePassword').mockResolvedValue(undefined);

    await authService.changePassword(1, 'OldPass123!', 'NewPass123!@#');

    expect(mockUser.checkPassword).toHaveBeenCalledWith('OldPass123!');
    expect(userServiceMock.updatePassword).toHaveBeenCalledWith(
      1,
      'NewPass123!@#',
    );
  });
});
