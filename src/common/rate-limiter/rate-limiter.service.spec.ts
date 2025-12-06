import { Test, TestingModule } from '@nestjs/testing';
import { RateLimiterService } from './rate-limiter.service';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

describe('RateLimiterService', () => {
  let service: RateLimiterService;
  let mockRedisClient: any;

  beforeEach(async () => {
    mockRedisClient = {
      zadd: jest.fn(),
      zremrangebyscore: jest.fn(),
      zcard: jest.fn(),
      expire: jest.fn(),
      del: jest.fn(),
      zrange: jest.fn(),
      ttl: jest.fn(),
    };

    jest
      .spyOn(RateLimiterService.prototype as any, 'initializeRedis')
      .mockImplementation(async function mockInit() {
        (this as any).redisClient = mockRedisClient;
      });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimiterService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'REDIS_URL') return 'redis://localhost:6379';
              if (key === 'RATE_LIMIT_TTL') return '900';
              if (key === 'RATE_LIMIT_MAX') return '100';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RateLimiterService>(RateLimiterService);

    // Suppress logger errors in tests
    jest.spyOn(service['logger'], 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should allow request when under limit', async () => {
      mockRedisClient.zremrangebyscore.mockResolvedValue(0);
      mockRedisClient.zcard.mockResolvedValue(5);
      mockRedisClient.zadd.mockResolvedValue(1);
      mockRedisClient.expire.mockResolvedValue(1);

      const result = await service.checkRateLimit('test-key', 100, 900000);

      expect(result.limited).toBe(false);
      expect(result.remaining).toBe(94);
      expect(result.resetAt).toBeGreaterThan(Date.now());
      expect(mockRedisClient.zadd).toHaveBeenCalled();
      expect(mockRedisClient.zcard).toHaveBeenCalled();
    });

    it('should block request when over limit', async () => {
      mockRedisClient.zremrangebyscore.mockResolvedValue(0);
      mockRedisClient.zcard.mockResolvedValue(101);
      mockRedisClient.zrange.mockResolvedValue([`${Date.now() - 1000}`]);

      const result = await service.checkRateLimit('test-key', 100, 900000);

      expect(result.limited).toBe(true);
      expect(result.remaining).toBe(0);
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });

    it('should throw error when Redis fails', async () => {
      mockRedisClient.zremrangebyscore.mockRejectedValue(
        new Error('Redis connection failed'),
      );

      await expect(
        service.checkRateLimit('test-key', 100, 900000),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('resetRateLimit', () => {
    it('should reset rate limit for a key', async () => {
      mockRedisClient.del.mockResolvedValue(1);

      await service.resetRateLimit('test-key');

      expect(mockRedisClient.del).toHaveBeenCalledWith('ratelimit:test-key');
    });

    it('should throw error when Redis fails', async () => {
      mockRedisClient.del.mockRejectedValue(
        new Error('Redis connection failed'),
      );

      await expect(service.resetRateLimit('test-key')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getStatus', () => {
    it('should return current status', async () => {
      mockRedisClient.zcard.mockResolvedValue(10);
      mockRedisClient.ttl.mockResolvedValue(60);

      const result = await service.getStatus('test-key');

      expect(result).not.toBeNull();
      expect(result.count).toBe(10);
      expect(result.resetAt).toBeGreaterThan(Date.now());
    });

    it('should return null when Redis fails', async () => {
      mockRedisClient.zcard.mockRejectedValue(
        new Error('Redis connection failed'),
      );

      const result = await service.getStatus('test-key');

      expect(result).toBeNull();
    });
  });
});
