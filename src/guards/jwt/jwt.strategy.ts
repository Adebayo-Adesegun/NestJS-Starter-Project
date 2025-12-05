import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly config: ConfigService) {
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

    // Additional validation can be added here (e.g., check if user still exists)
    return {
      userId: payload.sub,
      username: payload.username,
      iat: payload.iat,
      exp: payload.exp,
    };
  }
}
