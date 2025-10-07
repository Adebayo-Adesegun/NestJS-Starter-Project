# NestJS Starter Template

[![Node](https://img.shields.io/badge/node-22.x-339933?logo=node.js&logoColor=white)](./package.json)
[![CI](https://github.com/Adebayo-Adesegun/NestJS-Starter-Project/actions/workflows/ci.yml/badge.svg)](https://github.com/Adebayo-Adesegun/NestJS-Starter-Project/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/Adebayo-Adesegun/NestJS-Starter-Project/branch/main/graph/badge.svg)](https://codecov.io/gh/Adebayo-Adesegun/NestJS-Starter-Project)

Build production-grade APIs faster with NestJS 10, TypeORM, JWT auth, RBAC scaffolding, email, health/metrics, OpenAPI docs, and strong defaults for DX and security.

— Developer-focused, batteries included, minimal surprises.

## Highlights

- API versioning: global prefix `/api/v1`
- Auth: Local login + JWT (global `JwtAuthGuard`, opt-out with `@Public()`)
- RBAC scaffolding: roles/permissions entities, guards, and route metadata
- Validation & errors: global `ValidationPipe` + uniform error responses via `HttpExceptionFilter`
- Config: `.env` with schema validation (`class-validator`), `@nestjs/config`
- Database: TypeORM + Postgres, auto entity loading, migrations
- Mailer: `@nestjs-modules/mailer` with Handlebars templates, preview mode
- Security: Helmet, CORS from env, global rate limiting (Throttler)
- Observability: Swagger at `/docs`, health checks, Prometheus metrics
- Logging: Pino JSON logs with pretty output in dev
- Testing: Jest (unit + e2e), 80% coverage thresholds enforced
- CI: GitHub Actions for lint, test, build + secret scanning (Gitleaks)

Node.js 22 is required (see `package.json` engines).

## Quickstart

1. Copy and configure environment

```bash
cp .env.example .env
```

1. Install dependencies

```bash
npm ci
```

1. Run migrations (requires a running Postgres instance as configured in `.env`)

```bash
npm run migration:run
```

1. Start the API

```bash
npm run start:dev
```

1. Explore docs

Open Swagger UI at <http://localhost:9000/docs>

The API itself is served under <http://localhost:9000/api/v1>

## Environment variables

All variables are validated at startup. See `src/config/env.validation.ts` for the schema and `env.example` for sane defaults.

- Core
  - NODE_ENV: development | production | test
  - PORT: HTTP port (example: 9000)
  - ALLOWED_ORIGINS: CORS origins (comma-separated or `*`)
- Database (Postgres)
  - DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME, DATABASE_SSL
- JWT
  - JWT_SECRET (required), JWT_EXPIRES_IN (e.g. `60s`, `1h`)
- Mail
  - MAIL_TRANSPORT: full transport URL (optional)
  - OR: MAIL_HOST, MAIL_PORT, MAIL_SECURE, MAIL_USER, MAIL_PASSWORD
  - MAIL_FROM: default from address (e.g., "Nest Starter <no-reply@example.com>")
  - MAIL_PREVIEW: `true` to preview instead of sending (dev)
  - MAIL_TEMPLATE_PATH: defaults to `./src/mailer/templates`
- AWS (optional, S3 client prepared)
  - AWS_BUCKET, AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY

## NPM scripts

- start: `nest start`
- start:dev: `nest start --watch`
- start:prod: `node dist/main`
- build: `nest build`
- lint: ESLint with `--fix`
- test: unit tests, `test:watch`, `test:cov`, `test:e2e`
- TypeORM migrations:
  - Generate: `npm run migration:generate --name=AddSomething`
  - Run: `npm run migration:run`
  - Revert: `npm run migration:revert`
  - Show: `npm run migration:show`

Note: `migration:generate` uses npm env args; `--name=MyMigration` populates the filename.

## Database & migrations

TypeORM is configured in `src/config/database-config.ts`:

- Entities auto-loaded from `src/**/*.entity.ts`
- Migrations in `src/migrations`
- `synchronize` is disabled (use migrations)

First time setup:

```bash
# Ensure Postgres is running and .env is correct
npm run migration:run
```

Create a new migration:

```bash
npm run migration:generate --name=add_permissions
```

## API usage

Base URL: <http://localhost:9000/api/v1>

### Auth

- Register: POST `/auth/register` (public)

Example body:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Passw0rd1",
  "phoneNumber": "+15555550123",
  "countryCode": "US",
  "acceptTos": true
}
```

- Login: POST `/auth/login` (public via `@Public()` + Local Strategy)

The Local strategy expects `username` and `password` fields. In this template, `username` is your email.

```json
{
  "username": "john@example.com",
  "password": "Passw0rd1"
}
```

Response includes a JWT in `access_token`. All other routes (unless marked `@Public()`) require:

```http
Authorization: Bearer <token>
```

### Mailer

- Send email: POST `/mail/send` (JWT required, throttled to 3/min per client)

```json
{
  "to": "you@example.com",
  "subject": "Hello from NestJS",
  "text": "Optional plain text",
  "template": "generic",
  "context": { "title": "Welcome", "message": "It works!" }
}
```

When `MAIL_PREVIEW=true`, emails are rendered and previewed instead of being sent.

### Health checks

- `GET /health` comprehensive check (DB + memory)
- `GET /health/live` liveness probe
- `GET /health/ready` readiness (DB)

### Metrics (Prometheus)

- `GET /metrics` exposes default Prometheus metrics (`prom-client`)

### Swagger/OpenAPI

- UI: <http://localhost:9000/docs>
- Bearer auth enabled: click "Authorize" and paste your JWT

## Security & rate limiting

- Helmet enabled by default
- CORS origins controlled by `ALLOWED_ORIGINS`
- Throttling: global 100 req/min; adjust in `src/app.module.ts`
- Mail endpoint has explicit throttle: 3 req/min

## Logging

Structured JSON logs via Pino (`pino-http`). Pretty output in non-production.

## Error responses

All unhandled errors are normalized by `HttpExceptionFilter` to the shape below:

```json
{
  "success": false,
  "statusCode": 400,
  "code": "VALIDATION_FAILED",
  "message": [
    "email must be an email"
  ],
  "path": "/api/v1/auth/register",
  "method": "POST",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

See types in `src/shared/errors/error-codes.ts` and `src/shared/swagger/error-schema.ts`.

## RBAC scaffolding

- Entities: `role`, `permission`, `roles_permission`, `user_role`
- Guards: `RolesGuard`, `PermissionsGuard` (not global by default)
- Usage example for a route:

```ts
@UseGuards(RolesGuard, PermissionsGuard)
@SetMetadata('roles', ['Level 1 Admin'])
@SetMetadata('permissions', ['sample-permission'])
```

Note: Only `JwtAuthGuard` and `ThrottlerGuard` are global in this template.

## Testing

Run unit tests:

```bash
npm test
```

Coverage report:

```bash
npm run test:cov
```

E2E tests:

```bash
npm run test:e2e
```

Coverage thresholds are set to 80% globally in `package.json`.

## CI/CD

GitHub Actions:

- `ci.yml`: lint, test (with coverage), build on pushes/PRs to `main`
- `secret-scan.yml`: runs Gitleaks to prevent committing secrets

Coverage reporting:

- Codecov is integrated via `codecov/codecov-action@v4` uploading `coverage/lcov.info`.
- For public repos, uploads are tokenless by default. For private repos, set `CODECOV_TOKEN` as a repository secret and add `token: ${{ secrets.CODECOV_TOKEN }}` to the action.
- Badge reflects coverage on the `main` branch.

## Troubleshooting

- App fails at startup with validation errors: check `.env` against `src/config/env.validation.ts`
- DB connection errors: verify Postgres is reachable and credentials match `.env`
- 401 Unauthorized: ensure you’re sending a valid Bearer token (see login)
- CORS blocked: update `ALLOWED_ORIGINS` (comma-separated) or set to `*` for local dev
- Emails not received: set `MAIL_PREVIEW=false` and valid SMTP settings or use a dev SMTP like MailHog/MailDev
- Swagger not loading: ensure the server is running and open <http://localhost:9000/docs>
- Node version mismatch: use Node 22 (see `engines`)

## License

UNLICENSED (see `package.json`)

