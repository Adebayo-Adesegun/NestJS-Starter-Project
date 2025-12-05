import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../core/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Important: don't ignore expiration
      secretOrKey: config.get<string>('JWT_SECRET'),
      algorithms: ['HS256'], // Only allow specific algorithm to prevent algorithm substitution attacks
    });
  }

  async validate(payload: any) {
    // Validate payload structure
    if (!payload.sub || !payload.username) {
      this.logger.warn(
        `Invalid JWT payload structure: ${JSON.stringify(payload)}`,
      );
      throw new UnauthorizedException('Invalid token payload');
    }

    // Check if user still exists and validate passwordChangedAt for session invalidation
    const user = await this.userRepository.findOne({
      where: { id: payload.sub } as any,
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // If user changed password after token was issued, invalidate session
    if (user.passwordChangedAt) {
      const tokenIssuedAtSeconds = payload.iat || Math.floor(Date.now() / 1000);
      const passwordChangedAtSeconds = Math.floor(
        user.passwordChangedAt.getTime() / 1000,
      );
      if (tokenIssuedAtSeconds < passwordChangedAtSeconds) {
        this.logger.warn(
          `Token invalidated for user ${user.id}: password changed after token issued`,
        );
        throw new UnauthorizedException(
          'Token invalidated due to recent password change. Please login again.',
        );
      }
    }

    return {
      userId: payload.sub,
      username: payload.username,
      iat: payload.iat,
      exp: payload.exp,
    };
  }
}
