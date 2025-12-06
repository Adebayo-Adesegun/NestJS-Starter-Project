import { Test, TestingModule } from '@nestjs/testing';
import { AccountLockoutService } from './account-lockout.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../core/entities/user.entity';
import { ConfigService } from '@nestjs/config';

describe('AccountLockoutService', () => {
  let service: AccountLockoutService;
  let mockUserRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountLockoutService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'MAX_FAILED_ATTEMPTS') return '5';
              if (key === 'LOCKOUT_DURATION_MINUTES') return '15';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AccountLockoutService>(AccountLockoutService);
  });

  describe('recordFailedAttempt', () => {
    it('should record failed attempt', async () => {
      const email = 'test@example.com';

      const result = await service.recordFailedAttempt(email);

      expect(result).toBe(false);
      const attempts = service['failedAttempts'].get(email);
      expect(attempts).toBeDefined();
      expect(attempts.count).toBe(1);
    });

    it('should lock account after max failed attempts', async () => {
      const email = 'test@example.com';
      const mockUser = {
        email,
        isLocked: false,
        lockedUntil: null,
      } as unknown as User;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      for (let i = 0; i < 5; i++) {
        await service.recordFailedAttempt(email);
      }

      const attempts = service['failedAttempts'].get(email);
      expect(attempts.count).toBe(5);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should reset attempts after window expires', async () => {
      const email = 'test@example.com';

      service['failedAttempts'].set(email, {
        count: 3,
        timestamp: Date.now() - 20 * 60 * 1000, // 20 minutes ago
      });

      await service.recordFailedAttempt(email);

      const attempts = service['failedAttempts'].get(email);
      expect(attempts.count).toBe(1); // Reset to 1
    });
  });

  describe('clearFailedAttempts', () => {
    it('should clear failed attempts', () => {
      const email = 'test@example.com';
      service['failedAttempts'].set(email, { count: 3, timestamp: Date.now() });

      service.clearFailedAttempts(email);

      const attempts = service['failedAttempts'].get(email);
      expect(attempts).toBeUndefined();
    });
  });

  describe('getRemainingLockoutTime', () => {
    it('should return 0 when no attempts recorded', () => {
      const email = 'test@example.com';
      const result = service.getRemainingLockoutTime(email);
      expect(result).toBe(0);
    });

    it('should return 0 when lockout expired', () => {
      const email = 'test@example.com';
      service['failedAttempts'].set(email, {
        count: 5,
        timestamp: Date.now() - 20 * 60 * 1000,
      });

      const result = service.getRemainingLockoutTime(email);
      expect(result).toBe(0);
    });

    it('should return remaining time when within lockout duration', () => {
      const email = 'test@example.com';
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      service['failedAttempts'].set(email, {
        count: 5,
        timestamp: fiveMinutesAgo,
      });

      const result = service.getRemainingLockoutTime(email);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(10 * 60 * 1000);
    });
  });
});
