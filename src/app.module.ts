import config from './config/app.config';
import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      validate,
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    UtilityModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
