# NestJS Starter Template

## Features

- Authentication (Local & JWT)
- Role-based access control and permissions
- TypeORM with Postgres and migrations
- Mailer module with Handlebars templates

## Mailer Configuration

Set the following environment variables (see `env.example`):

- MAIL_TRANSPORT: Optional full transport URL, e.g., `smtp://user:pass@smtp.mailtrap.io:2525`
- MAIL_HOST: SMTP host (if not using MAIL_TRANSPORT)
- MAIL_PORT: SMTP port (if not using MAIL_TRANSPORT)
- MAIL_SECURE: `true` to use TLS
- MAIL_USER: SMTP username
- MAIL_PASSWORD: SMTP password
- MAIL_FROM: Default from address (e.g., `"Nest Starter <no-reply@example.com>"`)
- MAIL_PREVIEW: `true` to preview emails in dev instead of sending
- MAIL_TEMPLATE_PATH: Path to templates dir (default `./src/mailer/templates`)

### Sending a test mail

Start the app and call the endpoint:

- POST `/mail/send`

Body:

```json
{
  "to": "you@example.com",
  "subject": "Hello from NestJS",
  "template": "generic",
  "context": { "title": "Welcome", "message": "It works!" }
}
```

If `MAIL_PREVIEW=true`, the email will be rendered and previewed rather than actually sent.

## Rate limiting (Throttling)

This project enables global throttling via `ThrottlerModule` with defaults of `limit: 100` requests per `ttl: 60` seconds.

Additionally, the endpoint `POST /mail/send` is explicitly throttled with `@Throttle(3, 60)`, limiting it to 3 requests per minute per client.

To adjust limits:

- Global defaults: edit `ThrottlerModule.forRoot({ ttl, limit })` in `src/app.module.ts`.
- Endpoint-specific: edit the `@Throttle(x, y)` decorator in `src/mailer/mailer.controller.ts`.

## Install & Run

```bash
npm install
npm run start:dev
```

## Tests

```bash
npm test
```
