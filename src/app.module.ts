import config from './config/app.config';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { validate } from './config/env.validation';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { UtilityModule } from './utility/utility.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt/jwt-auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmAsyncConfig } from './config/typeorm-config';
import { AdminModule } from './admin/admin.module';
import { MailerModule } from './mailer/mailer.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { CommonModule } from './common/common.module';
import { CsrfMiddleware } from './common/middleware/csrf.middleware';
import { InputSanitizationMiddleware } from './common/middleware/input-sanitization.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      validate,
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 100,
      },
    ]),
    UtilityModule,
    CommonModule,
    AuthModule,
    UsersModule,
    AdminModule,
    MailerModule,
    HealthModule,
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(InputSanitizationMiddleware, CsrfMiddleware).forRoutes('*');
  }
}
