import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => {
  const transport = process.env.MAIL_TRANSPORT;
  const host = process.env.MAIL_HOST || 'localhost';
  const port = Number(process.env.MAIL_PORT || 1025);
  const secure = String(process.env.MAIL_SECURE || 'false') === 'true';
  const user = process.env.MAIL_USER || '';
  const pass = process.env.MAIL_PASSWORD || '';
  const from = process.env.MAIL_FROM || 'no-reply@example.com';
  const preview = String(process.env.MAIL_PREVIEW || 'true') === 'true';
  const templatePath =
    process.env.MAIL_TEMPLATE_PATH || './src/mailer/templates';

  return {
    from,
    preview,
    templatePath,
    transport: transport || {
      host,
      port,
      secure,
      auth: user || pass ? { user, pass } : undefined,
    },
  };
});
