import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Rate Limiter Service
 * Provides distributed rate limiting with Redis (REQUIRED)
 *
 * Production requirement:
 * - Install ioredis: npm install ioredis
 * - Set REDIS_URL env var: redis://localhost:6379
 *
 * This service enforces Redis usage to ensure consistency
 * across multiple application instances.
 */
@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly redisUrl: string;
  private redisClient: any = null;

  constructor(private readonly configService: ConfigService) {
    this.redisUrl = this.configService.get<string>('REDIS_URL');
    if (!this.redisUrl) {
      throw new InternalServerErrorException(
        'REDIS_URL is required for rate limiting. Please configure Redis in environment variables.',
      );
    }
    this.initializeRedis();
  }

  /**
   * Initialize Redis connection (REQUIRED)
   */
  private async initializeRedis(): Promise<void> {
    try {
      // Dynamic import to avoid hard dependency on ioredis
      // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
      const Redis = require('ioredis').default || require('ioredis');
      this.redisClient = new Redis(this.redisUrl);

      this.redisClient.on('error', (err: Error) => {
        this.logger.error(`Redis connection error: ${err.message}`);
      });

      this.redisClient.on('connect', () => {
        this.logger.log('Redis rate limiter connected successfully');
      });

      this.logger.log('Redis rate limiter initialized');
    } catch (err) {
      this.logger.error(
        'Redis initialization failed. Install ioredis: npm install ioredis',
      );
      throw new InternalServerErrorException(
        'Rate limiting service unavailable. Redis connection required.',
      );
    }
  }

  /**
   * Check if IP/key has exceeded rate limit using Redis
   * Returns true if limit exceeded, false if within limit
   */
  async checkRateLimit(
    key: string,
    maxRequests: number,
    windowMs: number,
  ): Promise<{ limited: boolean; remaining: number; resetAt: number }> {
    const now = Date.now();
    const windowStart = now - windowMs;
    const redisKey = `ratelimit:${key}`;

    try {
      // Use Redis ZSET to track requests by timestamp
      // This provides distributed rate limiting across instances
      await this.redisClient.zremrangebyscore(redisKey, '-inf', windowStart);
      const count = await this.redisClient.zcard(redisKey);

      if (count >= maxRequests) {
        // Get oldest request timestamp to calculate reset time
        const oldest = await this.redisClient.zrange(redisKey, 0, 0);
        const resetAt =
          oldest.length > 0 ? parseInt(oldest[0]) + windowMs : now + windowMs;
        return {
          limited: true,
          remaining: 0,
          resetAt,
        };
      }

      // Add current request
      await this.redisClient.zadd(redisKey, now, now.toString());
      await this.redisClient.expire(redisKey, Math.ceil(windowMs / 1000));

      return {
        limited: false,
        remaining: maxRequests - count - 1,
        resetAt: now + windowMs,
      };
    } catch (err) {
      this.logger.error(
        `Redis rate limit check failed: ${err?.message}. Rejecting request.`,
      );
      throw new InternalServerErrorException(
        'Rate limiting service unavailable',
      );
    }
  }

  /**
   * Reset rate limit for a key (e.g., after successful action)
   */
  async resetRateLimit(key: string): Promise<void> {
    try {
      await this.redisClient.del(`ratelimit:${key}`);
    } catch (err) {
      this.logger.error(`Redis reset failed for key ${key}: ${err?.message}`);
      throw new InternalServerErrorException('Failed to reset rate limit');
    }
  }

  /**
   * Get current rate limit status for debugging
   */
  async getStatus(
    key: string,
  ): Promise<{ count: number; resetAt: number } | null> {
    try {
      const count = await this.redisClient.zcard(`ratelimit:${key}`);
      const ttl = await this.redisClient.ttl(`ratelimit:${key}`);
      return {
        count,
        resetAt: Date.now() + (ttl > 0 ? ttl * 1000 : 0),
      };
    } catch (err) {
      this.logger.error(`Redis status check failed: ${err?.message}`);
      return null;
    }
  }
}
