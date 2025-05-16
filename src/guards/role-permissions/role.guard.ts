import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminService } from '../services/admin.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private adminService: AdminService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true; // If there are no roles defined, then the access is granted
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const userRoles = await this.getUserRoles(user.id);
    return roles.every((role) => userRoles.includes(role));
  }

  private async getUserRoles(userId: number): Promise<string[]> {
    const userRoles = await this.adminService.getUserRoles(userId);
    const roles: string[] = userRoles.map((role: any) => role.name);
    return roles;
  }
}
