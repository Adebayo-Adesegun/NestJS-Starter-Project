<div align="center">

# 🚀 NestJS Starter Template

### Production-Ready API Boilerplate

[![Node.js](https://img.shields.io/badge/node-22.x-339933?logo=node.js&logoColor=white)](./package.json)
[![NestJS](https://img.shields.io/badge/nestjs-10.x-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![CI](https://github.com/Adebayo-Adesegun/NestJS-Starter-Project/actions/workflows/ci.yml/badge.svg)](https://github.com/Adebayo-Adesegun/NestJS-Starter-Project/actions/workflows/ci.yml)
[![Test Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen)](./coverage)
[![License](https://img.shields.io/badge/license-UNLICENSED-blue.svg)](./package.json)

**Build production-grade REST APIs faster with enterprise-ready features, security best practices, and exceptional developer experience.**

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [API Usage](#-api-usage) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Configuration](#️-configuration)
- [🗄️ Database & Migrations](#️-database--migrations)
- [📡 API Usage](#-api-usage)
- [🔒 Security](#-security)
- [🧪 Testing](#-testing)
- [🚢 Deployment](#-deployment)
- [📚 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)
- [🐛 Troubleshooting](#-troubleshooting)
- [📄 License](#-license)

---

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT Authentication** - Secure token-based auth with refresh strategies
- **RBAC System** - Complete role-based access control scaffolding
- **Account Security** - Password strength validation, lockout protection, reset flows
- **Guard System** - Global JWT guard with `@Public()` decorator for opt-out routes

### 🛡️ Security
- **Rate Limiting** - Global throttling (100 req/min) with per-route overrides
- **Helmet Integration** - Security headers out of the box
- **CORS Protection** - Configurable origin whitelisting
- **Input Validation** - Global validation pipe with detailed error messages
- **Secret Scanning** - Automated Gitleaks scanning in CI/CD

### 🗃️ Database
- **TypeORM + PostgreSQL** - Production-ready ORM with migration support
- **Auto Entity Loading** - Automatic entity discovery from `src/**/*.entity.ts`
- **Migration CLI** - Generate, run, revert migrations with npm scripts
- **Connection Pooling** - Optimized database connections

### 📧 Email System
- **Template Engine** - Handlebars templates with reusable layouts
- **Preview Mode** - Test emails without SMTP in development
- **Queue Ready** - Async email processing foundation
- **Multi-Transport** - SMTP, SES, or custom transport support

### 📊 Observability
- **Swagger/OpenAPI** - Interactive API docs at `/docs`
- **Health Checks** - Liveness and readiness probes for K8s
- **Prometheus Metrics** - Built-in metrics endpoint at `/metrics`
- **Structured Logging** - JSON logs via Pino with pretty dev output

### 🧪 Testing & Quality
- **Jest Framework** - Unit, integration, and E2E tests
- **95%+ Coverage** - Enforced code coverage thresholds
- **CI/CD Pipeline** - GitHub Actions for lint, test, and build
- **TypeScript Strict** - Full type safety across the codebase

### 🎯 Developer Experience
- **API Versioning** - Global `/api/v1` prefix with version strategy
- **Hot Reload** - Fast development with Nest CLI watch mode
- **Environment Validation** - Runtime validation of all env variables
- **Error Handling** - Uniform error responses with detailed codes
- **Audit Logging** - Track security-critical operations

> **Requirements:** Node.js 22.x or higher (see `package.json` engines)

---

## 🚀 Quick Start

Get up and running in 5 minutes:

### Prerequisites

- **Node.js 22.x** or higher
- **PostgreSQL 14+** instance
- **npm** or **yarn** package manager

### Installation

**1️⃣ Clone the repository**

```bash
git clone https://github.com/Adebayo-Adesegun/NestJS-Starter-Project.git
cd nestjs-starter-template
```

**2️⃣ Install dependencies**

```bash
npm ci
```

**3️⃣ Configure environment**

```bash
cp .env.example .env
# Edit .env with your database credentials and secrets
```

**4️⃣ Run database migrations**

```bash
npm run migration:run
```

**5️⃣ Start the development server**

```bash
npm run start:dev
```

**6️⃣ Explore the API**

- 🌐 **API Base URL:** http://localhost:9000/api/v1
- 📖 **Swagger Docs:** http://localhost:9000/docs
- ❤️ **Health Check:** http://localhost:9000/health
- 📊 **Metrics:** http://localhost:9000/metrics

> 💡 **Tip:** The API uses JWT authentication. Most endpoints require a Bearer token. See [Authentication](#authentication) for details.

---

## ⚙️ Configuration

All environment variables are validated at startup using `class-validator`. See `src/config/env.validation.ts` for the complete schema.

### Core Settings

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Application environment | `development` \| `production` \| `test` | ✅ |
| `PORT` | HTTP server port | `9000` | ✅ |
| `ALLOWED_ORIGINS` | CORS allowed origins | `https://app.com,https://admin.com` or `*` | ✅ |

### Database (PostgreSQL)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_HOST` | PostgreSQL host | `localhost` | ✅ |
| `DATABASE_PORT` | PostgreSQL port | `5432` | ✅ |
| `DATABASE_USER` | Database user | `postgres` | ✅ |
| `DATABASE_PASSWORD` | Database password | `your_password` | ✅ |
| `DATABASE_NAME` | Database name | `nestjs_starter` | ✅ |
| `DATABASE_SSL` | Enable SSL connection | `true` \| `false` | ❌ |

### JWT Authentication

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET` | Secret key for JWT signing | `your-super-secret-key-change-in-production` | ✅ |
| `JWT_EXPIRES_IN` | Token expiration time | `1h`, `7d`, `60s` | ✅ |

### Email Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `MAIL_TRANSPORT` | Full transport URL | `smtp://user:pass@smtp.example.com` | ❌ |
| `MAIL_HOST` | SMTP host | `smtp.gmail.com` | ✅* |
| `MAIL_PORT` | SMTP port | `587` | ✅* |
| `MAIL_SECURE` | Use TLS | `true` \| `false` | ✅* |
| `MAIL_USER` | SMTP username | `your-email@gmail.com` | ✅* |
| `MAIL_PASSWORD` | SMTP password | `your-app-password` | ✅* |
| `MAIL_FROM` | Default sender | `"NestJS Starter <no-reply@example.com>"` | ✅ |
| `MAIL_PREVIEW` | Preview mode (dev) | `true` | ❌ |
| `MAIL_TEMPLATE_PATH` | Template directory | `./src/mailer/templates` | ❌ |

_*Required if `MAIL_TRANSPORT` is not provided_

### AWS (Optional)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `AWS_BUCKET` | S3 bucket name | `my-bucket` | ❌ |
| `AWS_REGION` | AWS region | `us-east-1` | ❌ |
| `AWS_ACCESS_KEY` | AWS access key | `AKIAIOSFODNN7EXAMPLE` | ❌ |
| `AWS_SECRET_KEY` | AWS secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` | ❌ |

> 📝 **Note:** Copy `.env.example` to `.env` and customize for your environment. Never commit `.env` to version control.

---

### Available Scripts

#### Development

```bash
npm run start:dev    # Start with hot-reload watch mode
npm run start:debug  # Start with debug mode
npm run start:prod   # Start production build
```

#### Building

```bash
npm run build        # Compile TypeScript to dist/
npm run lint         # Run ESLint with auto-fix
npm run format       # Format code with Prettier
```

#### Testing

```bash
npm test             # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:cov     # Generate coverage report
npm run test:e2e     # Run end-to-end tests
```

#### Database Migrations

```bash
npm run migration:generate --name=AddUserTable  # Generate migration from entity changes
npm run migration:run                            # Run pending migrations
npm run migration:revert                         # Revert last migration
npm run migration:show                           # Show migration status
```

> 💡 **Tip:** Migration name is passed via `--name=MigrationName` and must use camelCase or PascalCase.

---

## 🗄️ Database & Migrations

### TypeORM Configuration

The project uses **TypeORM** with **PostgreSQL**. Configuration is in `src/config/database-config.ts`:

- ✅ **Auto Entity Discovery** - All entities in `src/**/*.entity.ts` are loaded automatically
- ✅ **Migration-Based** - `synchronize: false` enforces migration-driven schema changes
- ✅ **Connection Pooling** - Optimized for production workloads
- ✅ **SSL Support** - Configurable via `DATABASE_SSL` environment variable

### Database Setup

**Initial setup:**

```bash
# Ensure PostgreSQL is running
npm run migration:run
```

### Working with Migrations

**Generate a migration from entity changes:**

```bash
npm run migration:generate --name=AddUserRoles
```

**Create an empty migration:**

```bash
npm run migration:create --name=SeedInitialData
```

**Run pending migrations:**

```bash
npm run migration:run
```

**Revert the last migration:**

```bash
npm run migration:revert
```

**Check migration status:**

```bash
npm run migration:show
```

### Migration Best Practices

- 🎯 **One purpose per migration** - Keep migrations focused and atomic
- 🔄 **Always test revert** - Ensure `down()` method properly undoes `up()`
- 📝 **Descriptive names** - Use clear, action-oriented names like `AddEmailIndexToUsers`
- 🚫 **Never edit applied migrations** - Create a new migration to fix issues
- ✅ **Version control** - Commit migrations with your code changes

---

## 📡 API Usage

**Base URL:** `http://localhost:9000/api/v1`

### Authentication

#### Register a New User

**Endpoint:** `POST /auth/register` (Public)

```bash
curl -X POST http://localhost:9000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "phoneNumber": "+15555550123",
    "countryCode": "US",
    "acceptTos": true
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### Login

**Endpoint:** `POST /auth/login` (Public)

> 📌 **Note:** The `username` field should contain the user's email address.

```bash
curl -X POST http://localhost:9000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGci0iJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    "user": {
      "id": 1,
      "email": "john@example.com",
      "firstName": "John"
    }
  }
}
```

#### Using the JWT Token

Include the token in the `Authorization` header for protected routes:

```bash
curl -X GET http://localhost:9000/api/v1/users/profile \
  -H "Authorization: Bearer <your_token_here>"
```

---

### Email Service

**Endpoint:** `POST /mail/send` (Authenticated, Rate Limited: 3 req/min)

```bash
curl -X POST http://localhost:9000/api/v1/mail/send \
  -H "Authorization: Bearer <your_token_here>" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "recipient@example.com",
    "subject": "Welcome to NestJS Starter",
    "template": "generic",
    "context": {
      "title": "Welcome Aboard!",
      "message": "Thanks for trying our API."
    }
  }'
```

> 💡 **Dev Tip:** Set `MAIL_PREVIEW=true` in `.env` to preview emails in your browser instead of sending.

---

### Health Checks

Perfect for **Kubernetes**, **Docker**, and monitoring systems:

| Endpoint | Purpose | Use Case |
|----------|---------|----------|
| `GET /health` | Comprehensive check | Overall system health (DB + Memory) |
| `GET /health/live` | Liveness probe | Container restart trigger |
| `GET /health/ready` | Readiness probe | Load balancer routing |

**Example:**

```bash
curl http://localhost:9000/health
```

**Response:**

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" }
  }
}
```

---

### Prometheus Metrics

**Endpoint:** `GET /metrics`

Exposes application metrics in Prometheus format:

```bash
curl http://localhost:9000/metrics
```

**Sample Output:**

```
# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds.
# TYPE process_cpu_user_seconds_total counter
process_cpu_user_seconds_total 0.015

# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/health",status="200"} 42
```

---

### Interactive API Documentation

**Swagger UI:** <http://localhost:9000/docs>

Features:

- 📖 **Interactive Docs** - Try API endpoints directly from the browser
- 🔐 **JWT Authentication** - Click "Authorize" button to add your Bearer token
- 📝 **Request/Response Examples** - See detailed schemas for all endpoints
- 🎯 **OpenAPI 3.0** - Export spec for code generation tools

---

## 🔒 Security

Security is built-in, not bolted-on:

### 🛡️ HTTP Security Headers

**Helmet** is enabled by default, providing:

- Content Security Policy (CSP)
- X-Frame-Options (Clickjacking protection)
- X-Content-Type-Options (MIME sniffing prevention)
- Strict-Transport-Security (HTTPS enforcement)
- X-XSS-Protection

### 🚦 Rate Limiting

Protection against brute-force and DoS attacks:

| Scope | Limit | Configuration |
|-------|-------|---------------|
| **Global** | 100 requests/minute | `src/app.module.ts` |
| **Email API** | 3 requests/minute | Per-route override |
| **Auth Login** | Custom lockout | Account lockout service |

**Customize rate limits:**

```typescript
// src/app.module.ts
ThrottlerModule.forRoot([{
  ttl: 60000,  // Time window (ms)
  limit: 100,  // Max requests per window
}])
```

### 🌐 CORS Protection

Controlled via `ALLOWED_ORIGINS` environment variable:

```bash
# Single origin
ALLOWED_ORIGINS=https://myapp.com

# Multiple origins
ALLOWED_ORIGINS=https://app.com,https://admin.app.com

# Development (⚠️ NOT for production)
ALLOWED_ORIGINS=*
```

### 🔑 Authentication & Authorization

- **JWT Tokens** - Stateless authentication with configurable expiration
- **Password Policies** - Enforced strength requirements
- **Account Lockout** - Automatic lockout after failed attempts
- **Role-Based Access Control (RBAC)** - Fine-grained permissions

### 🔍 Secret Scanning

**Gitleaks** runs automatically in CI/CD to prevent credential leaks:

```yaml
# .github/workflows/secret-scan.yml
- Scans commits for exposed secrets
- Blocks PRs with detected secrets
- Covers 900+ secret patterns
```

### 📋 Security Best Practices

- ✅ Environment variables validated at startup
- ✅ SQL injection prevention via TypeORM parameterization
- ✅ Input validation with `class-validator`
- ✅ Secure password hashing with bcrypt
- ✅ No sensitive data in error responses
- ✅ Audit logging for security events

> 🔐 **Production Checklist:** See [SECURITY.md](./SECURITY.md) for deployment security guidelines.

---

## 📊 Logging & Monitoring

### Structured Logging

**Pino** provides fast, structured JSON logging:

```typescript
// Automatic request/response logging
{
  "level": 30,
  "time": 1699564800000,
  "req": {
    "method": "GET",
    "url": "/api/v1/users/1",
    "remoteAddress": "127.0.0.1"
  },
  "res": {
    "statusCode": 200
  },
  "responseTime": 42
}
```

**Development mode:** Pretty-printed, human-readable logs

**Production mode:** JSON format for centralized logging (ELK, CloudWatch, etc.)

### Audit Trail

Security-sensitive operations are automatically logged:

- User authentication attempts
- Permission changes
- Data exports
- Admin actions

See `src/common/audit/audit-logger.service.ts` for implementation.

---

### Error Handling

All errors follow a consistent format via `HttpExceptionFilter`:

```json
{
  "success": false,
  "statusCode": 400,
  "code": "VALIDATION_FAILED",
  "message": [
    "email must be an email",
    "password must be at least 8 characters"
  ],
  "path": "/api/v1/auth/register",
  "method": "POST",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

**Error Code Reference:**

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_FAILED` | 400 | Request validation errors |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate resource |
| `INTERNAL_ERROR` | 500 | Server error |

See `src/common/errors/error-codes.ts` for the complete list.

---

## 🎭 Role-Based Access Control (RBAC)

Complete RBAC scaffolding with database entities and guards:

### Database Schema

```
┌─────────┐      ┌──────────────┐      ┌────────────┐
│  User   │──────│  user_role   │──────│    Role    │
└─────────┘      └──────────────┘      └────────────┘
                                              │
                                              │
                                    ┌─────────────────┐
                                    │ roles_permission│
                                    └─────────────────┘
                                              │
                                              │
                                      ┌───────────┐
                                      │Permission │
                                      └───────────┘
```

### Guard Usage

**Protect routes with roles:**

```typescript
import { UseGuards, SetMetadata } from '@nestjs/common';
import { RolesGuard } from './guards/role-permissions/roles.guard';

@UseGuards(RolesGuard)
@SetMetadata('roles', ['Admin', 'Moderator'])
@Get('admin/dashboard')
async getAdminDashboard() {
  // Only accessible to Admin or Moderator roles
}
```

**Protect routes with permissions:**

```typescript
import { PermissionsGuard } from './guards/role-permissions/permissions.guard';

@UseGuards(PermissionsGuard)
@SetMetadata('permissions', ['users:delete', 'users:ban'])
@Delete('users/:id')
async deleteUser(@Param('id') id: string) {
  // Requires users:delete AND users:ban permissions
}
```

**Combine both:**

```typescript
@UseGuards(RolesGuard, PermissionsGuard)
@SetMetadata('roles', ['Admin'])
@SetMetadata('permissions', ['reports:export'])
@Get('reports/export')
async exportReports() {
  // User must be Admin AND have reports:export permission
}
```

> 📌 **Note:** Only `JwtAuthGuard` and `ThrottlerGuard` are applied globally. RBAC guards are opt-in per route.

---

## 🧪 Testing

Comprehensive testing suite with **Jest** and high coverage standards.

### Running Tests

**Unit tests:**

```bash
npm test              # Run all unit tests
npm run test:watch   # Watch mode for development
```

**Coverage report:**

```bash
npm run test:cov     # Generate HTML coverage report
```

View the report at `coverage/lcov-report/index.html`

**End-to-end tests:**

```bash
npm run test:e2e     # Full integration tests
```

### Coverage Standards

Enforced thresholds in `package.json`:

| Metric | Threshold | Current |
|--------|-----------|---------|
| **Statements** | 80% | ✅ 95.57% |
| **Branches** | 69% | ✅ 69.17% |
| **Functions** | 80% | ✅ 92.64% |
| **Lines** | 80% | ✅ 95.25% |

### Test Structure

```
src/
├── auth/
│   ├── auth.service.ts
│   ├── auth.service.spec.ts      # Unit tests
│   ├── auth.controller.ts
│   └── auth.controller.spec.ts
test/
└── app.e2e-spec.ts                # E2E tests
```

### Best Practices

- ✅ **Unit tests** for services and business logic
- ✅ **Controller tests** with mocked services
- ✅ **E2E tests** for critical user flows
- ✅ **Coverage thresholds** enforced in CI/CD
- ✅ **Isolated tests** - No shared state between tests

> 💡 **Tip:** Run `npm run test:watch` during development for instant feedback.

---

## 🚢 Deployment

### CI/CD Pipeline

Automated workflows via **GitHub Actions**:

#### 📋 CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and pull request to `main`:

```yaml
✓ Install dependencies
✓ Run ESLint
✓ Run unit tests
✓ Generate coverage report
✓ Build production bundle
```

#### 🔐 Secret Scanning (`.github/workflows/secret-scan.yml`)

Prevents credential leaks:

```yaml
✓ Scan commits with Gitleaks
✓ Detect 900+ secret patterns
✓ Block PRs with exposed secrets
```

### Production Build

**Build the application:**

```bash
npm run build
```

**Output:** Compiled JavaScript in `dist/` directory

**Start production server:**

```bash
NODE_ENV=production npm run start:prod
```

### Environment Considerations

| Environment | Configuration |
|-------------|---------------|
| **Development** | Hot reload, pretty logs, email preview |
| **Production** | Optimized build, JSON logs, SSL required |
| **Testing** | In-memory fixtures, isolated tests |

### Deployment Platforms

This template is ready for:

- 🐳 **Docker/Kubernetes** - Health checks and metrics built-in
- ☁️ **AWS/GCP/Azure** - Environment-based configuration
- 🚀 **Heroku/Railway** - Procfile compatible
- 🔧 **PM2/systemd** - Process management ready

**Sample Docker deployment:**

```dockerfile
FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY src/mailer/templates ./src/mailer/templates

EXPOSE 9000
CMD ["node", "dist/main"]
```

### Database Migrations in Production

**Run migrations before deploying:**

```bash
npm run build
npm run migration:run
npm run start:prod
```

Or use a pre-deployment script in your CI/CD pipeline.

---

## 📚 Documentation

### Project Structure

```text
src/
├── auth/                 # Authentication & authorization
│   ├── dto/             # Login, register DTOs
│   ├── guards/          # JWT, Local, RBAC guards
│   └── strategies/      # Passport strategies
├── user/                # User management
├── mailer/              # Email service & templates
├── common/              # Shared utilities
│   ├── audit/          # Audit logging
│   ├── filters/        # Exception filters
│   ├── middleware/     # CSRF, logging
│   └── rate-limiter/   # Rate limiting service
├── config/              # Configuration modules
├── core/                # Core entities & interfaces
├── guards/              # Global guards
├── health/              # Health check endpoints
├── metrics/             # Prometheus metrics
└── migrations/          # Database migrations
```

### Additional Resources

- 📖 [API Security Guide](./API_SECURITY.md)
- 🔒 [Security Summary](./SECURITY_SUMMARY.md)
- 🛡️ [Security Policy](./SECURITY.md)
- 📦 [NestJS Documentation](https://docs.nestjs.com)
- 🗄️ [TypeORM Documentation](https://typeorm.io)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- ✅ Follow existing code style (ESLint + Prettier)
- ✅ Add tests for new features
- ✅ Update documentation as needed
- ✅ Ensure all tests pass (`npm test`)
- ✅ Maintain coverage above thresholds

---

## 🐛 Troubleshooting

### Common Issues

<details>
<summary><strong>🔴 App fails at startup with validation errors</strong></summary>

**Cause:** Missing or invalid environment variables

**Solution:** 
```bash
# Verify .env against src/config/env.validation.ts
cp .env.example .env
# Edit .env with proper values
```
</details>

<details>
<summary><strong>🔴 Database connection errors</strong></summary>

**Cause:** PostgreSQL not running or wrong credentials

**Solution:**
```bash
# Check PostgreSQL is running
pg_isready

# Verify credentials in .env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
```
</details>

<details>
<summary><strong>🔴 401 Unauthorized responses</strong></summary>

**Cause:** Missing or invalid JWT token

**Solution:**

```bash
# Login first to get token
curl -X POST http://localhost:9000/api/v1/auth/login \
  -d '{"username":"your@email.com","password":"yourpass"}'

# Use the token in subsequent requests
curl -H "Authorization: Bearer <your_token_here>" \
  http://localhost:9000/api/v1/users/profile
```
</details>

<details>
<summary><strong>🔴 CORS errors in browser</strong></summary>

**Cause:** Origin not in `ALLOWED_ORIGINS`

**Solution:**
```bash
# Development
ALLOWED_ORIGINS=*

# Production (comma-separated)
ALLOWED_ORIGINS=https://app.com,https://admin.app.com
```
</details>

<details>
<summary><strong>🔴 Emails not being sent</strong></summary>

**Cause:** Invalid SMTP configuration or preview mode enabled

**Solution:**
```bash
# Option 1: Use preview mode for development
MAIL_PREVIEW=true

# Option 2: Configure real SMTP
MAIL_PREVIEW=false
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```
</details>

<details>
<summary><strong>🔴 Swagger not loading</strong></summary>

**Cause:** Server not running or wrong URL

**Solution:**
```bash
# Ensure server is running
npm run start:dev

# Access Swagger at
http://localhost:9000/docs  # ✅ Correct
http://localhost:9000/api/v1/docs  # ❌ Wrong
```
</details>

<details>
<summary><strong>🔴 Node version mismatch</strong></summary>

**Cause:** Using Node.js version below 22.x

**Solution:**
```bash
# Check version
node --version

# Install Node 22 with nvm
nvm install 22
nvm use 22
```
</details>

### Getting Help

- 📝 **GitHub Issues:** [Report bugs or request features](https://github.com/Adebayo-Adesegun/NestJS-Starter-Project/issues)
- 💬 **Discussions:** [Ask questions](https://github.com/Adebayo-Adesegun/NestJS-Starter-Project/discussions)

---

## 📄 License

**UNLICENSED** - See [package.json](./package.json) for details.

---

<div align="center">

**Built with ❤️ using [NestJS](https://nestjs.com)**

⭐ **Star this repo if you find it helpful!**

[Report Bug](https://github.com/Adebayo-Adesegun/NestJS-Starter-Project/issues) • [Request Feature](https://github.com/Adebayo-Adesegun/NestJS-Starter-Project/issues) • [Documentation](https://github.com/Adebayo-Adesegun/NestJS-Starter-Project)

</div>

