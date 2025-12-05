# Security Implementation Guide

This document outlines the OWASP-compliant security measures implemented in this NestJS starter template.

## Overview of Security Enhancements

This project implements industry-standard security practices to protect against common web vulnerabilities documented in the OWASP Top 10.

---

## 1. Authentication & Authorization

### JWT-based Authentication
- **Location**: `src/guards/jwt/jwt.strategy.ts`, `src/auth/auth.module.ts`
- **Implementation**:
  - Uses JWT (JSON Web Token) for stateless authentication
  - Enforces bearer token authentication via Authorization header
  - Validates token expiration (disabled `ignoreExpiration: false`)
  - Restricts algorithm to HS256 to prevent algorithm substitution attacks

### Account Lockout Mechanism (Brute-force Protection)
- **Location**: `src/auth/account-lockout.service.ts`
- **Features**:
  - Tracks failed login attempts
  - Locks account after 5 failed attempts
  - 15-minute lockout period with attempt window reset
  - Prevents credential stuffing attacks
  - Uses in-memory store (consider Redis for production)

### Strong Password Requirements
- **Location**: `src/user/validator/strong-password.validator.ts`
- **Requirements**:
  - Minimum 12 characters (increased from 8)
  - At least 1 uppercase letter (A-Z)
  - At least 1 lowercase letter (a-z)
  - At least 1 number (0-9)
  - At least 1 special character (!@#$%^&*)
- **Applied to**: User registration and password change endpoints

### Password Storage
- **Location**: `src/core/entities/user.entity.ts`
- **Implementation**:
  - Uses bcrypt for password hashing (v5.1.1)
  - Auto-generates salt before hashing
  - Salted hashes prevent rainbow table attacks

---

## 2. Input Validation & Sanitization

### Request Validation Pipeline
- **Location**: `src/main.ts`
- **Features**:
  - Global ValidationPipe with strict configuration:
    - `whitelist: true` - Removes unknown properties
    - `forbidNonWhitelisted: true` - Rejects unknown properties
    - `forbidUnknownValues: true` - Rejects unknown objects
    - `enableImplicitConversion: false` - Prevents implicit type coercion attacks

### Input Sanitization Middleware
- **Location**: `src/shared/middleware/input-sanitization.middleware.ts`
- **Features**:
  - Removes HTML tags from string inputs
  - Escapes dangerous characters to prevent XSS
  - Validates maximum string length (10,000 chars)
  - Validates maximum array length (1,000 items)
  - Applies to request body, query params, and URL parameters

### DTO Validation
- **Location**: `src/auth/dto/`, `src/user/dto/`
- **Validators Used**:
  - `@IsEmail()` - Email format validation
  - `@IsISO31661Alpha2()` - Country code validation
  - `@IsNotEmpty()` - Required field validation
  - `@MinLength()` - Minimum length validation
  - `@IsStrongPassword()` - Custom strong password validator
  - `@Validate(IsUserEmailAlreadyExist)` - Unique email validation
  - `@Transform()` - Data transformation (e.g., toLowerCase())

---

## 3. CSRF Protection

### CSRF Middleware
- **Location**: `src/shared/middleware/csrf.middleware.ts`
- **Implementation**:
  - Double-submit cookie pattern
  - Token stored in `__Host-csrf-token` cookie (secure prefix)
  - Token validated for state-changing requests (POST, PUT, DELETE, PATCH)
  - Uses `sameSite: 'strict'` for SameSite cookie attribute
  - Secure flag set based on protocol (HTTPS in production)
  - Public endpoints bypass CSRF validation

---

## 4. Security Headers (Helmet.js)

### Location
`src/main.ts`

### Implemented Headers
```
Content-Security-Policy:
- default-src: 'self'
- styleSrc: 'self', 'unsafe-inline'
- scriptSrc: 'self'
- imgSrc: 'self', 'data:', 'https:'

Strict-Transport-Security (HSTS):
- max-age: 31536000 (1 year)
- includeSubDomains: true
- preload: true

X-Frame-Options: DENY (prevents clickjacking)
X-Content-Type-Options: nosniff (prevents MIME sniffing)
X-XSS-Protection: enabled
Referrer-Policy: strict-origin-when-cross-origin
```

---

## 5. SQL Injection Prevention

### TypeORM Parameterized Queries
- **Location**: `src/config/database-config.ts`, all service files
- **Features**:
  - TypeORM uses parameterized queries by default
  - All queries built via QueryBuilder use parameter binding
  - Example: `where('user.email = :email', { email })`
  - Prevents SQL injection attacks

### Database Configuration
- **Location**: `src/config/database-config.ts`
- **Security Features**:
  - Connection pooling (max 20 connections)
  - Query timeout: 5 seconds (prevents resource exhaustion)
  - SSL/TLS support for database connections (configurable)
  - Logging of slow queries (>5 seconds) in development only

---

## 6. Error Handling & Information Disclosure

### Secure Error Filter
- **Location**: `src/shared/filters/http-exception.filter.ts`
- **Features**:
  - Logs full error details internally (never exposed to users)
  - In production, hides internal error details (returns generic message)
  - Includes safe response metadata:
    - statusCode
    - code (ErrorCode enum)
    - path, method, timestamp
  - Prevents information leakage about system internals

### Logging Configuration
- **Location**: `src/main.ts`, `src/config/database-config.ts`
- **Features**:
  - Structured JSON logging with Pino
  - Redacts sensitive headers:
    - `req.headers.authorization`
    - `req.headers.cookie`
  - Development: colorized output
  - Production: JSON format only

---

## 7. Rate Limiting & DDOS Protection

### Throttler Module
- **Location**: `src/app.module.ts`, `@nestjs/throttler`
- **Configuration**:
  - Global limit: 100 requests per 60 seconds
  - Can be customized per route with `@Throttle()` decorator
  - Prevents brute-force attacks
  - Mitigates simple DDOS attempts

---

## 8. Environment Configuration Security

### Environment Validation
- **Location**: `src/config/env.validation.ts`
- **Features**:
  - Validates all required environment variables at startup
  - Type validation for numbers and strings
  - Password strength validation (min 12 chars for DB, min 32 for JWT)
  - Throws error on missing or invalid env variables
  - Prevents misconfiguration in production

### Secrets Management
- **Database Password**: Minimum 12 characters
- **JWT Secret**: Minimum 32 characters (strong entropy requirement)
- **Never commit `.env` files** - Use `.env.example` as template

---

## 9. CORS Configuration

### Location
`src/main.ts`

### Implementation
- Configurable `ALLOWED_ORIGINS` via environment variable
- Credentials allowed for authenticated requests
- Exposed headers: `Authorization`
- **Production Warning**: Never use `*` as origin - specify explicit domains

---

## 10. Dependencies & Vulnerabilities

### Security-Related Dependencies
- `bcrypt@^5.1.1` - Password hashing
- `helmet@^8.1.0` - Security headers
- `@nestjs/throttler@^5.2.0` - Rate limiting
- `class-validator@^0.14.0` - Input validation
- `class-transformer@^0.5.1` - DTO transformation
- `passport@^0.7.0` - Authentication framework
- `@nestjs/jwt@^10.2.0` - JWT handling

### Recommended Security Practices
1. **Regular Updates**: Run `npm audit` and update dependencies regularly
2. **Dependency Scanning**: Use GitHub Dependabot or similar tools
3. **Lock Files**: Commit `package-lock.json` to ensure reproducible builds

---

## 11. Database Security

### Best Practices Implemented
1. **Parameterized Queries**: All queries use TypeORM's QueryBuilder
2. **Connection Pooling**: Limits concurrent connections
3. **SSL/TLS**: Support for encrypted database connections
4. **Query Logging**: Development only (not in production)
5. **Automatic Entity Loading**: TypeOrmModule.forFeature() prevents manual entity exposure

---

## 12. Deployment Checklist

Before deploying to production, ensure:

- [ ] All environment variables are set securely
- [ ] `NODE_ENV=production`
- [ ] `DATABASE_PASSWORD` is at least 12 characters (use strong random)
- [ ] `JWT_SECRET` is at least 32 characters (use strong random)
- [ ] Database SSL is enabled: `DATABASE_SSL=true`
- [ ] `ALLOWED_ORIGINS` specifies exact frontend domain(s)
- [ ] HTTPS is enabled on production server
- [ ] Headers are reviewed and CSP is adjusted for your frontend
- [ ] Database backups are configured
- [ ] Monitoring and alerting are in place
- [ ] Regular security audits are scheduled
- [ ] Dependencies are up to date (`npm audit fix`)

---

## 13. Additional Security Recommendations

### Implement These for Production
1. **Database Encryption**: Enable encryption at rest for sensitive data
2. **Redis Session Store**: Replace in-memory account lockout with Redis
3. **API Key Authentication**: For service-to-service communication
4. **Refresh Token Rotation**: Implement token refresh with rotation
5. **Audit Logging**: Log all authentication and authorization events
6. **Two-Factor Authentication (2FA)**: Add TOTP or SMS-based 2FA
7. **Request ID Tracking**: Add correlation IDs for request tracing
8. **Secrets Rotation**: Implement automated secret rotation
9. **Security Scanning**: Add SAST (Static Application Security Testing) in CI/CD
10. **Penetration Testing**: Conduct regular security assessments

### Compliance Considerations
- **GDPR**: Implement data retention and deletion policies
- **HIPAA**: If handling health data, implement required controls
- **PCI DSS**: If handling payment data, implement PCI compliance measures
- **SOC 2**: Consider SOC 2 Type II certification for enterprise deployments

---

## 14. Testing Security Measures

### Unit Tests
```bash
npm test
```

### Security Testing
```bash
# Check dependencies for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix
```

---

## 15. OWASP Top 10 Coverage

| OWASP Category | Implementation |
|---|---|
| A01: Broken Access Control | JWT auth, role-based guards, permission checks |
| A02: Cryptographic Failures | Bcrypt hashing, HTTPS ready, secure cookies |
| A03: Injection | Parameterized queries, input sanitization |
| A04: Insecure Design | Secure defaults, CSRF protection |
| A05: Security Misconfiguration | Env validation, error filtering, secure headers |
| A06: Vulnerable Components | Dependency management, regular updates |
| A07: Auth Failures | Account lockout, strong passwords, JWT validation |
| A08: Data Integrity Failures | CSRF middleware, signed tokens |
| A09: Logging & Monitoring | Structured logging, error logging |
| A10: SSRF | Input validation, URL validation |

---

## Contact & Support

For security issues, please email security@example.com instead of using public issue trackers.

Last Updated: December 2025
Security Review Status: ✅ OWASP Compliant
