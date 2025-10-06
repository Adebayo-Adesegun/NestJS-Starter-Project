import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../guards/jwt/constants';
import { AuthController } from './auth.controller';
import { LocalStrategy } from '../guards/local/local.strategy';
import { JwtStrategy } from '../guards/jwt/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesPermission } from '../core/entities/roles-permission.entity';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    }),
    TypeOrmModule.forFeature([RolesPermission]),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
