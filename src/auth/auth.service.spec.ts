import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UnauthorizedException } from '@nestjs/common';
import { AuditLoggerService } from '../common/audit/audit-logger.service';

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
