import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

/**
 * Audit Logger Service
 * Generic and reusable service for logging security-relevant events
 * Automatically handles PII (Personally Identifiable Information) hashing
 */
@Injectable()
export class AuditLoggerService {
  private readonly logger = new Logger('AUDIT');

  /**
   * Hash sensitive data for logging (SHA256 first 8 chars)
   * Provides consistency without exposing sensitive data
   */
  private hashSensitiveData(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex')
      .substring(0, 8);
  }

  /**
   * Generic audit log method
   * @param event - Event name (e.g., 'PASSWORD_RESET_REQUESTED', 'LOGIN_FAILED')
   * @param metadata - Object containing event metadata
   * @param level - Log level: 'log' (info), 'warn', 'error' (default: 'log')
   *
   * Example usage:
   * auditLogger.log('PASSWORD_RESET_REQUESTED', { email: 'user@example.com' });
   * auditLogger.log('RATE_LIMIT_EXCEEDED', { ip: '1.2.3.4', endpoint: '/auth/login' }, 'warn');
   */
  log(
    event: string,
    metadata: Record<string, any> = {},
    level: 'log' | 'warn' | 'error' = 'log',
  ): void {
    // Process metadata to hash sensitive fields
    const processedMetadata = { ...metadata };

    // Auto-hash email addresses
    if (processedMetadata.email) {
      const email = processedMetadata.email as string;
      processedMetadata.email_hash = this.hashSensitiveData(email);
      processedMetadata.email_domain = email.split('@')[1] || 'unknown';
      delete processedMetadata.email; // Remove original email
    }

    // Format metadata as key-value pairs
    const metadataString = Object.entries(processedMetadata)
      .map(([key, value]) => `${key}: ${value}`)
      .join(' | ');

    const logMessage = metadataString ? `${event} | ${metadataString}` : event;

    this.logger[level](logMessage);
  }
}
