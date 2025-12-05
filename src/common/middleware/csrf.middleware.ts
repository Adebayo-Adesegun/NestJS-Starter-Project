import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

/**
 * CSRF Protection Middleware
 * Implements double-submit cookie pattern with SameSite attribute
 * For state-changing requests (POST, PUT, DELETE, PATCH), validates CSRF token
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly csrfTokenLength = 32;
  private readonly csrfTokenName = 'x-csrf-token';
  private readonly csrfCookieName = '__Host-csrf-token';

  use(req: Request, res: Response, next: NextFunction) {
    // Generate CSRF token if not present
    if (!req.cookies[this.csrfCookieName]) {
      const token = randomBytes(this.csrfTokenLength).toString('hex');
      res.cookie(this.csrfCookieName, token, {
        httpOnly: false, // Allow JS to read for sending in header
        secure: req.protocol === 'https',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/',
      });
    }

    // Validate CSRF token for state-changing requests
    const isStateChangingRequest = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(
      req.method,
    );

    if (isStateChangingRequest) {
      const tokenFromCookie = req.cookies[this.csrfCookieName];
      const tokenFromHeader =
        req.get(this.csrfTokenName) ||
        req.get('x-csrf-token') ||
        (req.body && req.body._csrf);

      // Skip CSRF validation for public endpoints
      if (!this.isPublicEndpoint(req.path)) {
        if (
          !tokenFromCookie ||
          !tokenFromHeader ||
          tokenFromCookie !== tokenFromHeader
        ) {
          return res.status(403).json({
            success: false,
            statusCode: 403,
            code: 'CSRF_TOKEN_INVALID',
            message: 'CSRF token validation failed',
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    next();
  }

  /**
   * Check if endpoint is public (doesn't require CSRF protection)
   * Update based on your public endpoints
   */
  private isPublicEndpoint(path: string): boolean {
    const publicPaths = ['/api/v1/auth/register', '/api/v1/auth/login'];
    return publicPaths.some((p) => path.startsWith(p));
  }
}
