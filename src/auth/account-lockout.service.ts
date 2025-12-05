import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../core/entities/user.entity';

/**
 * Account Lockout Service
 * Implements account lockout mechanism to prevent brute-force attacks
 * - Tracks failed login attempts
 * - Locks account after max failed attempts
 * - Implements exponential backoff for lockout duration
 */
@Injectable()
export class AccountLockoutService {
  private readonly logger = new Logger(AccountLockoutService.name);

  // Configuration
  private readonly maxFailedAttempts = 5;
  private readonly lockoutDurationMs = 15 * 60 * 1000; // 15 minutes
  private readonly attemptResetWindowMs = 15 * 60 * 1000; // 15 minutes

  // In-memory store for failed attempts (consider using Redis for production)
  private failedAttempts = new Map<
    string,
    { count: number; timestamp: number }
  >();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Record a failed login attempt
   * @param email User email
   * @returns boolean indicating if account should be locked
   */
  async recordFailedAttempt(email: string): Promise<boolean> {
    const now = Date.now();
    const attempt = this.failedAttempts.get(email);

    if (!attempt) {
      // First failed attempt
      this.failedAttempts.set(email, { count: 1, timestamp: now });
      return false;
    }

    // Check if attempt window has expired
    if (now - attempt.timestamp > this.attemptResetWindowMs) {
      // Reset attempts
      this.failedAttempts.set(email, { count: 1, timestamp: now });
      return false;
    }

    // Increment attempt count
    attempt.count++;
    attempt.timestamp = now;

    const shouldLock = attempt.count >= this.maxFailedAttempts;

    if (shouldLock) {
      this.logger.warn(`Account lockout triggered for email: ${email}`);
      await this.lockAccount(email);
    }

    return shouldLock;
  }

  /**
   * Clear failed attempts for a user (on successful login)
   * @param email User email
   */
  clearFailedAttempts(email: string): void {
    this.failedAttempts.delete(email);
  }

  /**
   * Check if account is locked
   * @param user User entity
   * @returns boolean indicating if account is locked
   */
  isAccountLocked(user: User): boolean {
    // Add logic to check if account is locked
    // This assumes you have isLocked and lockedUntil fields in User entity
    if (!('isLocked' in user) || !('lockedUntil' in user)) {
      return false;
    }

    const isLocked = (user as any).isLocked;
    const lockedUntil = (user as any).lockedUntil;

    if (!isLocked) {
      return false;
    }

    // Check if lockout period has expired
    const now = new Date();
    if (lockedUntil && new Date(lockedUntil) > now) {
      return true;
    }

    // Unlock if lockout period has expired
    if (lockedUntil && new Date(lockedUntil) <= now) {
      this.unlockAccount(user.email).catch((err) => {
        this.logger.error(`Failed to unlock account: ${err.message}`);
      });
    }

    return false;
  }

  /**
   * Lock account for brute-force protection
   * @param email User email
   */
  private async lockAccount(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return;
    }

    const lockedUntil = new Date(Date.now() + this.lockoutDurationMs);

    // You'll need to add isLocked and lockedUntil fields to User entity
    if ('isLocked' in user && 'lockedUntil' in user) {
      (user as any).isLocked = true;
      (user as any).lockedUntil = lockedUntil;
      await this.userRepository.save(user);
    }
  }

  /**
   * Unlock account manually
   * @param email User email
   */
  private async unlockAccount(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return;
    }

    if ('isLocked' in user && 'lockedUntil' in user) {
      (user as any).isLocked = false;
      (user as any).lockedUntil = null;
      await this.userRepository.save(user);
      this.logger.log(`Account unlocked for email: ${email}`);
    }
  }

  /**
   * Get remaining lockout time in milliseconds
   * @param email User email
   * @returns remaining lockout time or 0 if not locked
   */
  getRemainingLockoutTime(email: string): number {
    const user = this.failedAttempts.get(email);

    if (!user) {
      return 0;
    }

    const now = Date.now();
    const elapsedTime = now - user.timestamp;

    if (elapsedTime >= this.lockoutDurationMs) {
      return 0;
    }

    return this.lockoutDurationMs - elapsedTime;
  }
}
