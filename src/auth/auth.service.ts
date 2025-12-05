import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ErrorCodes } from '../common/errors/error-codes';
import { JwtService } from '@nestjs/jwt';
import { User } from '../core/entities/user.entity';
import { UserService } from '../user/user.service';
import { RolesPermission } from '../core/entities/roles-permission.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(RolesPermission)
    private readonly rolesPermissionRepository: Repository<RolesPermission>,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCodes.AUTH_INVALID_CREDENTIALS,
        message: 'Authentication failed',
      });
    }

    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        code: ErrorCodes.AUTH_INVALID_CREDENTIALS,
        message: 'Authentication failed',
      });
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

  async getPermissionsByRole(roleId: number): Promise<string[]> {
    const permissions = await this.rolesPermissionRepository
      .createQueryBuilder('rolePermission')
      .leftJoin('rolePermission.permission', 'permission')
      .where('rolePermission.roleId = :roleId', { roleId })
      .select('permission.name', 'name')
      .getRawMany();

    return permissions.map((permission) => permission.name);
  }
}
