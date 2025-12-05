import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Input Sanitization Middleware
 * Sanitizes string inputs to prevent XSS and injection attacks
 * - Removes HTML tags
 * - Escapes dangerous characters
 * - Validates input lengths
 */
@Injectable()
export class InputSanitizationMiddleware implements NestMiddleware {
  private readonly maxStringLength = 10000;
  private readonly maxArrayLength = 1000;

  use(req: Request, res: Response, next: NextFunction) {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = this.sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = this.sanitizeObject(req.query);
    }

    // Sanitize URL params
    if (req.params && typeof req.params === 'object') {
      req.params = this.sanitizeObject(req.params);
    }

    next();
  }

  private sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      if (obj.length > this.maxArrayLength) {
        throw new BadRequestException({
          statusCode: 400,
          message: [`Array exceeds maximum length of ${this.maxArrayLength}`],
        });
      }
      return obj.map((item) => this.sanitizeObject(item));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          sanitized[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }

    return obj;
  }

  private sanitizeString(str: string): string {
    if (typeof str !== 'string') {
      return str;
    }

    // Check string length
    if (str.length > this.maxStringLength) {
      throw new BadRequestException({
        statusCode: 400,
        message: [`String exceeds maximum length of ${this.maxStringLength}`],
      });
    }

    // Remove HTML tags using regex
    const withoutHtml = str.replace(/<[^>]*>/g, '');

    // Escape dangerous characters
    return withoutHtml
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}
