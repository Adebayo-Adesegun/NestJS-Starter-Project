import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Rate Limiter Service
 * Provides distributed rate limiting with Redis support (if configured)
 * Falls back to in-memory storage for simple deployments
 *
 * For production with multiple instances, use Redis:
 * - Install ioredis: npm install ioredis
 * - Set REDIS_URL env var: redis://localhost:6379
 */
@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly redisUrl?: string;
  private redisClient: any = null;

  private inMemoryStore: Map<string, { count: number; resetAt: number }> =
    new Map();

  private isRedisAvailable = false;

  constructor(private readonly configService: ConfigService) {
    this.redisUrl = this.configService.get<string>('REDIS_URL');
    this.initializeRedis();
  }

  /**
   * Initialize Redis connection if REDIS_URL is configured
   */
  private async initializeRedis(): Promise<void> {
    if (!this.redisUrl) {
      this.logger.log(
        'REDIS_URL not configured. Using in-memory rate limiter.',
      );
      return;
    }

    try {
      // Dynamic import to avoid hard dependency on ioredis
      // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
      const Redis = require('ioredis').default || require('ioredis');
      this.redisClient = new Redis(this.redisUrl);
      this.isRedisAvailable = true;
      this.logger.log('Redis rate limiter initialized successfully');
    } catch (err) {
      this.logger.warn(
        'Redis connection failed (ioredis not installed or REDIS_URL invalid). Falling back to in-memory limiter. Install with: npm install ioredis',
      );
      this.isRedisAvailable = false;
    }
  }

  /**
   * Check if IP/key has exceeded rate limit
   * Returns true if limit exceeded, false if within limit
   */
  async checkRateLimit(
    key: string,
    maxRequests: number,
    windowMs: number,
  ): Promise<{ limited: boolean; remaining: number; resetAt: number }> {
    if (this.isRedisAvailable) {
      return this.checkRateLimitRedis(key, maxRequests, windowMs);
    } else {
      return this.checkRateLimitMemory(key, maxRequests, windowMs);
    }
  }

  /**
   * Redis-based rate limiting
   */
  private async checkRateLimitRedis(
    key: string,
    maxRequests: number,
    windowMs: number,
  ): Promise<{ limited: boolean; remaining: number; resetAt: number }> {
    try {
      const now = Date.now();
      const windowStart = now - windowMs;
      const redisKey = `ratelimit:${key}`;

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
        `Redis rate limit check failed: ${err?.message}. Falling back to in-memory.`,
      );
      // Fallback to in-memory on Redis error
      return this.checkRateLimitMemory(key, maxRequests, windowMs);
    }
  }

  /**
   * In-memory rate limiting (for single instance or fallback)
   */
  private checkRateLimitMemory(
    key: string,
    maxRequests: number,
    windowMs: number,
  ): { limited: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = this.inMemoryStore.get(key);

    if (!entry) {
      // First request in this window
      this.inMemoryStore.set(key, { count: 1, resetAt: now + windowMs });
      return {
        limited: false,
        remaining: maxRequests - 1,
        resetAt: now + windowMs,
      };
    }

    if (now >= entry.resetAt) {
      // Window expired, reset counter
      this.inMemoryStore.set(key, { count: 1, resetAt: now + windowMs });
      return {
        limited: false,
        remaining: maxRequests - 1,
        resetAt: now + windowMs,
      };
    }

    if (entry.count >= maxRequests) {
      // Limit exceeded
      return {
        limited: true,
        remaining: 0,
        resetAt: entry.resetAt,
      };
    }

    // Increment counter within window
    entry.count += 1;
    return {
      limited: false,
      remaining: maxRequests - entry.count,
      resetAt: entry.resetAt,
    };
  }

  /**
   * Reset rate limit for a key (e.g., after successful login to clear failed attempts)
   */
  async resetRateLimit(key: string): Promise<void> {
    if (this.isRedisAvailable) {
      try {
        await this.redisClient.del(`ratelimit:${key}`);
      } catch (err) {
        this.logger.error(`Redis reset failed for key ${key}: ${err?.message}`);
      }
    } else {
      this.inMemoryStore.delete(key);
    }
  }

  /**
   * Get current rate limit status for debugging
   */
  async getStatus(
    key: string,
  ): Promise<{ count: number; resetAt: number } | null> {
    if (this.isRedisAvailable) {
      try {
        const count = await this.redisClient.zcard(`ratelimit:${key}`);
        const ttl = await this.redisClient.ttl(`ratelimit:${key}`);
        return {
          count,
          resetAt: Date.now() + (ttl > 0 ? ttl * 1000 : 0),
        };
      } catch (err) {
        return null;
      }
    } else {
      return this.inMemoryStore.get(key) || null;
    }
  }
}
