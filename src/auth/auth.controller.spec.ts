import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { AccountLockoutService } from './account-lockout.service';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: {} },
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
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    userService = module.get<UserService>(UserService);
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
});
