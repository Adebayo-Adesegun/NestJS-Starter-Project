import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../core/entities/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException(
        `401 Unauthorized: Authentication Failed.`,
      );
    }

    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        `401 Unauthorized: Authentication Failed.`,
      );
    }

    return user;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
