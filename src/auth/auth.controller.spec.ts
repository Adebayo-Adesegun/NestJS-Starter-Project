import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { AccountLockoutService } from './account-lockout.service';
import { AuditLoggerService } from '../common/audit/audit-logger.service';
import { RateLimiterService } from '../common/rate-limiter/rate-limiter.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let userService: UserService;
  let authService: AuthService;
  let accountLockoutService: AccountLockoutService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: AccountLockoutService,
          useValue: {
            recordFailedAttempt: jest.fn(),
            clearFailedAttempts: jest.fn(),
            isAccountLocked: jest.fn(),
            getRemainingLockoutTime: jest.fn(),
          },
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
        {
          provide: RateLimiterService,
          useValue: {
            checkRateLimit: jest.fn().mockResolvedValue({ limited: false, remaining: 2, resetAt: Date.now() + 3600000 }),
            resetRateLimit: jest.fn(),
            getStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
    accountLockoutService = module.get<AccountLockoutService>(
      AccountLockoutService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should return 201 with user on success', async () => {
      const dto = {
        email: 'john@example.com',
        password: 'Passw0rd!Test123',
        firstName: 'John',
        lastName: 'Doe',
      } as any;
      const user = { id: 1, ...dto } as any;
      (userService.create as jest.Mock).mockResolvedValue([
        true,
        'User created successfully',
        user,
      ]);

      const result = await controller.register(dto);
      expect(result).toEqual({
        statusCode: 201,
        message: ['User created successfully'],
        data: user,
      });
      expect(userService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw BadRequestException on failure', async () => {
      const dto = { email: 'already@exists.com' } as any;
      (userService.create as jest.Mock).mockResolvedValue([
        false,
        'Email already exists',
        null,
      ]);

      await expect(controller.register(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'user@example.com',
      password: 'SecurePass123!',
    };

    const mockUser = {
      id: 1,
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
    };

    const mockLoginResponse = {
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return 200 with access_token on successful login', async () => {
      (
        accountLockoutService.getRemainingLockoutTime as jest.Mock
      ).mockReturnValue(0);
      (authService.validateUser as jest.Mock).mockResolvedValue(mockUser);
      (authService.login as jest.Mock).mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual({
        statusCode: 200,
        message: ['Login successful'],
        data: {
          access_token: mockLoginResponse.access_token,
          user: {
            id: mockUser.id,
            firstName: mockUser.firstName,
            lastName: mockUser.lastName,
          },
        },
      });
      expect(
        accountLockoutService.getRemainingLockoutTime,
      ).toHaveBeenCalledWith(loginDto.email);
      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(accountLockoutService.clearFailedAttempts).toHaveBeenCalledWith(
        loginDto.email,
      );
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should throw UnauthorizedException when account is locked', async () => {
      const remainingTime = 30000; // 30 seconds remaining
      (
        accountLockoutService.getRemainingLockoutTime as jest.Mock
      ).mockReturnValue(remainingTime);

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      const error = await controller.login(loginDto).catch((e) => e);
      expect(error.getResponse()).toEqual({
        code: 'AUTH_ACCOUNT_LOCKED',
        message: expect.stringContaining('Account is locked'),
      });
      expect(
        accountLockoutService.getRemainingLockoutTime,
      ).toHaveBeenCalledWith(loginDto.email);
      expect(authService.validateUser).not.toHaveBeenCalled();
    });

    it('should record failed attempt and throw UnauthorizedException on invalid credentials', async () => {
      (
        accountLockoutService.getRemainingLockoutTime as jest.Mock
      ).mockReturnValue(0);
      (authService.validateUser as jest.Mock).mockRejectedValue(
        new Error('Invalid credentials'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(authService.validateUser).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password,
      );
      expect(accountLockoutService.recordFailedAttempt).toHaveBeenCalledWith(
        loginDto.email,
      );
      expect(accountLockoutService.clearFailedAttempts).not.toHaveBeenCalled();
    });

    it('should record failed attempt when authService throws UnauthorizedException', async () => {
      (
        accountLockoutService.getRemainingLockoutTime as jest.Mock
      ).mockReturnValue(0);
      const unauthorizedException = new UnauthorizedException(
        'Invalid credentials',
      );
      (authService.validateUser as jest.Mock).mockRejectedValue(
        unauthorizedException,
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(accountLockoutService.recordFailedAttempt).toHaveBeenCalledWith(
        loginDto.email,
      );
      expect(accountLockoutService.clearFailedAttempts).not.toHaveBeenCalled();
    });

    it('should clear failed attempts on successful login', async () => {
      (
        accountLockoutService.getRemainingLockoutTime as jest.Mock
      ).mockReturnValue(0);
      (authService.validateUser as jest.Mock).mockResolvedValue(mockUser);
      (authService.login as jest.Mock).mockResolvedValue(mockLoginResponse);

      await controller.login(loginDto);

      expect(accountLockoutService.clearFailedAttempts).toHaveBeenCalledWith(
        loginDto.email,
      );
      expect(accountLockoutService.recordFailedAttempt).not.toHaveBeenCalled();
    });

    it('should not clear failed attempts on failed login', async () => {
      (
        accountLockoutService.getRemainingLockoutTime as jest.Mock
      ).mockReturnValue(0);
      (authService.validateUser as jest.Mock).mockRejectedValue(
        new Error('Validation failed'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow();

      expect(accountLockoutService.clearFailedAttempts).not.toHaveBeenCalled();
      expect(accountLockoutService.recordFailedAttempt).toHaveBeenCalledWith(
        loginDto.email,
      );
    });
  });
});
