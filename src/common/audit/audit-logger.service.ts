import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Audit Logger Service
 * Logs security-relevant events without exposing PII (Personally Identifiable Information)
 * Uses hashing to prevent email addresses from appearing in logs
 */
@Injectable()
export class AuditLoggerService {
  private readonly logger = new Logger('AUDIT');

  /**
   * Hash an email address for logging (SHA256 first 8 chars)
   * Provides consistency without exposing sensitive data
   */
  private hashEmail(email: string): string {
    return crypto
      .createHash('sha256')
      .update(email)
      .digest('hex')
      .substring(0, 8);
  }

  /**
   * Log a password reset request
   */
  logPasswordResetRequested(email: string): void {
    const emailHash = this.hashEmail(email);
    const emailDomain = email.split('@')[1] || 'unknown';
    this.logger.log(
      `PASSWORD_RESET_REQUESTED | email_hash: ${emailHash} | domain: ${emailDomain}`,
    );
  }

  /**
   * Log a successful password reset
   */
  logPasswordResetSuccess(userId: number): void {
    this.logger.log(`PASSWORD_RESET_SUCCESS | user_id: ${userId}`);
  }

  /**
   * Log a password reset attempt with invalid token
   */
  logPasswordResetFailure(reason: string): void {
    this.logger.log(`PASSWORD_RESET_FAILURE | reason: ${reason}`);
  }

  /**
   * Log a password reset token being marked as used (preventing reuse)
   */
  logPasswordResetTokenUsed(userId: number): void {
    this.logger.log(`PASSWORD_RESET_TOKEN_USED | user_id: ${userId}`);
  }

  /**
   * Log a password change request by authenticated user
   */
  logPasswordChangeRequested(userId: number): void {
    this.logger.log(`PASSWORD_CHANGE_REQUESTED | user_id: ${userId}`);
  }

  /**
   * Log a successful password change
   */
  logPasswordChangeSuccess(userId: number): void {
    this.logger.log(`PASSWORD_CHANGE_SUCCESS | user_id: ${userId}`);
  }

  /**
   * Log a password change attempt with incorrect current password
   */
  logPasswordChangeFailure(userId: number, reason: string): void {
    this.logger.log(
      `PASSWORD_CHANGE_FAILURE | user_id: ${userId} | reason: ${reason}`,
    );
  }

  /**
   * Log multiple password reset requests from same IP within short window (abuse detection)
   */
  logRateLimitExceeded(ip: string, endpoint: string): void {
    this.logger.warn(`RATE_LIMIT_EXCEEDED | ip: ${ip} | endpoint: ${endpoint}`);
  }

  /**
   * Log token expiry (for cleanup/monitoring)
   */
  logPasswordResetTokenExpired(userId: number): void {
    this.logger.log(`PASSWORD_RESET_TOKEN_EXPIRED | user_id: ${userId}`);
  }
}
