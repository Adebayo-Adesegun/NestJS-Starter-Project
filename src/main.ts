import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ErrorResponseDto } from './shared/swagger/error-schema';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  const allowedOrigins = configService.get('ALLOWED_ORIGINS');

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    exposedHeaders: ['Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true, // Reject unknown properties
      forbidUnknownValues: true, // Reject unknown objects
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
      transformOptions: {
        enableImplicitConversion: false, // Prevent implicit type conversion
        strategy: 'excludeAll', // Only include properties decorated with @Expose
      },
    }),
  );
  // Structured JSON logging
  const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    redact: ['req.headers.authorization', 'req.headers.cookie'],
  });
  app.use(
    pinoHttp({
      logger,
      autoLogging: true,
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());
  // Security middleware - helmet with strict OWASP configuration
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: 'deny',
      },
      noSniff: true,
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
      xssFilter: true,
    }),
  );

  // API Versioning via URI (v1)
  app.setGlobalPrefix('api/v1');

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS Starter Template')
    .setDescription('API documentation for the NestJS starter')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig, {
    extraModels: [ErrorResponseDto],
  });
  SwaggerModule.setup('docs', app, swaggerDoc);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(port);
}
bootstrap();
