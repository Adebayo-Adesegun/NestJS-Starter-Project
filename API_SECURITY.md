# API Security Guidelines

## Authentication

### Login Endpoint
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response 200:
{
  "statusCode": 200,
  "message": ["Login successful"],
  "data": {
    "access_token": "<JWT_TOKEN_HERE>",
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}

Response 401:
{
  "success": false,
  "statusCode": 401,
  "code": "AUTH_INVALID_CREDENTIALS",
  "message": "Invalid email or password",
  "path": "/api/v1/auth/login",
  "method": "POST",
  "timestamp": "2025-12-05T10:30:00.000Z"
}
```

### Using the Access Token
All authenticated requests must include the JWT in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Account Lockout
After 5 failed login attempts within 15 minutes, the account is locked:

```
Response 401:
{
  "success": false,
  "statusCode": 401,
  "code": "AUTH_ACCOUNT_LOCKED",
  "message": "Account is locked. Try again in 897 seconds",
  "path": "/api/v1/auth/login",
  "method": "POST",
  "timestamp": "2025-12-05T10:35:00.000Z"
}
```

## Input Validation

### Required Fields
- All fields marked as required in DTOs will return 400 Bad Request if missing
- Unknown properties in request body will be rejected
- Array lengths are limited to 1,000 items
- String lengths are limited to 10,000 characters

### Email Validation
- Must be valid email format (RFC 5322)
- Converted to lowercase automatically
- Must be unique in the system

### Password Requirements
- Minimum 12 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (!@#$%^&*)

### Phone Number Validation
- Must be valid format for the country code provided
- libphonenumber-js validates phone numbers
- Must be unique in the system

### Country Code Validation
- Must be valid ISO 3166-1 alpha-2 code (e.g., US, GB, DE)
- Case-insensitive

## CSRF Protection

### Obtaining CSRF Token
The CSRF token is automatically set in the response cookie:

```
Set-Cookie: __Host-csrf-token=<token>; Path=/; Secure; HttpOnly; SameSite=Strict
```

### Using CSRF Token
For state-changing requests (POST, PUT, DELETE, PATCH), include the token:

```
POST /api/v1/users
Content-Type: application/json
X-CSRF-Token: <token>

{
  "name": "John Doe"
}
```

Or in the request body:
```json
{
  "name": "John Doe",
  "_csrf": "<token>"
}
```

## Rate Limiting

### Global Limits
- 100 requests per 60 seconds per IP address
- Throttle-Limit-Remaining header shows remaining requests
- Throttle-Reset header shows when limit resets

### Response Headers
```
Throttle-Limit: 100
Throttle-Remaining: 42
Throttle-Reset: 1733396410
```

### Rate Limit Exceeded
```
Response 429:
{
  "success": false,
  "statusCode": 429,
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests, please try again later",
  "path": "/api/v1/auth/login",
  "method": "POST",
  "timestamp": "2025-12-05T10:40:00.000Z"
}
```

## Error Handling

### Development Environment
Errors include detailed information for debugging:

```
{
  "success": false,
  "statusCode": 500,
  "code": "INTERNAL_ERROR",
  "message": "Cannot read property 'email' of undefined",
  "path": "/api/v1/users",
  "method": "POST",
  "timestamp": "2025-12-05T10:45:00.000Z"
}
```

### Production Environment
Errors are generic to prevent information disclosure:

```
{
  "success": false,
  "statusCode": 500,
  "code": "INTERNAL_ERROR",
  "message": "An unexpected error occurred. Please contact support.",
  "path": "/api/v1/users",
  "method": "POST",
  "timestamp": "2025-12-05T10:45:00.000Z"
}
```

### Validation Errors
```
Response 400:
{
  "success": false,
  "statusCode": 400,
  "code": "VALIDATION_FAILED",
  "message": [
    "email must be an email",
    "password must contain at least one capital letter",
    "acceptTos must be a boolean value"
  ],
  "path": "/api/v1/auth/register",
  "method": "POST",
  "timestamp": "2025-12-05T10:50:00.000Z"
}
```

## Security Headers

All responses include security headers:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data: https:
Referrer-Policy: strict-origin-when-cross-origin
```

## Best Practices

### 1. Always Use HTTPS
- All API endpoints must be accessed over HTTPS in production
- Insecure HTTP requests should be redirected to HTTPS

### 2. Validate on Both Client and Server
- Client-side validation improves UX
- Server-side validation provides security

### 3. Never Trust User Input
- Assume all input is potentially malicious
- Sanitize and validate all inputs

### 4. Implement Proper Logging
- Log authentication attempts
- Log failed validations
- Log errors (but not sensitive data)
- Never log passwords or tokens

### 5. Use Strong Credentials
- Encourage users to use strong passwords
- Implement password expiration policies
- Use HTTPS for all communication

### 6. Implement Proper Access Control
- Verify user permissions before processing requests
- Use role-based access control (RBAC)
- Implement resource-level authorization

### 7. Keep Dependencies Updated
- Run `npm audit` regularly
- Update vulnerable dependencies promptly
- Use security.md for vulnerability disclosure

## Testing Security

### Manual Testing
```bash
# Test strong password requirement
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "weak",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890",
    "countryCode": "US",
    "acceptTos": true
  }'
# Expected: 400 Bad Request with password validation error

# Test CSRF protection
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe"}'
# Expected: 403 Forbidden with CSRF token validation error

# Test rate limiting
for i in {1..101}; do
  curl http://localhost:3000/api/v1/health
done
# Expected: 101st request returns 429 Too Many Requests
```

### Security Scanning
```bash
# Check for vulnerability in dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Check security headers
curl -I http://localhost:3000/api/v1/health
```

## Incident Response

### Account Locked
If a user's account is locked due to failed login attempts:
1. Contact support to verify identity
2. Support can manually unlock via database or API call
3. Recommend password reset

### Suspicious Activity
If suspicious activity is detected:
1. Check logs for unusual patterns
2. Verify user's location and device
3. Consider requiring re-authentication

### Security Breach
If a security breach is suspected:
1. Immediately disable affected accounts
2. Force password reset
3. Review access logs
4. Notify affected users
5. Conduct security audit

## Compliance

This API implements controls for:
- OWASP Top 10
- GDPR (data protection)
- HIPAA (if health data)
- PCI-DSS (if payment data)

Verify compliance requirements for your specific use case.
