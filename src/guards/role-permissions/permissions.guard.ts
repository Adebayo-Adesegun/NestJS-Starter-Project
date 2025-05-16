import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminService } from '../services/admin.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private adminService: AdminService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );
    if (!permissions) {
      return true; // If there are no permissions defined, then the access is granted;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const userPermissions = await this.getUserPermissions(user.id);

    return permissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }

  private async getUserPermissions(userId: number): Promise<string[]> {
    const userRoles = await this.adminService.getUserRoles(userId);
    const rolesIds = userRoles.map((role: any) => role.id);

    const permissions: string[] = [];
    for (const roleId of rolesIds) {
      const rolePermissions = await this.adminService.getPermissionsByRole(
        roleId,
      );
      permissions.push(...rolePermissions);
    }
    return permissions;
  }
}
