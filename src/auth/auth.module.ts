import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { LocalStrategy } from '../guards/local/local.strategy';
import { JwtStrategy } from '../guards/jwt/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesPermission } from '../core/entities/roles-permission.entity';
import { AccountLockoutService } from './account-lockout.service';
import { User } from '../core/entities/user.entity';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN') || '1h',
        },
      }),
    }),
    TypeOrmModule.forFeature([RolesPermission, User]),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, AccountLockoutService],
  exports: [AuthService, AccountLockoutService],
  controllers: [AuthController],
})
export class AuthModule {}
