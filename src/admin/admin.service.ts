import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Permission } from '../core/entities/permission.entity';
import { UserRole } from '../core/entities/user-role.entity';
import { RolesPermission } from '../core/entities/roles-permission.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(RolesPermission)
    private readonly rolesPermissionRepository: Repository<RolesPermission>,
  ) {}

  async getPermissions(): Promise<Permission[]> {
    return await this.permissionRepository.find();
  }

  async getUserRoles(userId: number): Promise<UserRole[]> {
    return await this.userRoleRepository.find({
      where: { user: { id: userId } },
      relations: ['role'],
    });
  }

  async getPermissionsByRole(roleId: number): Promise<string[]> {
    const permissions = await this.rolesPermissionRepository.find({
      where: { role: { id: roleId } },
      relations: ['permission'],
    });
    return permissions.map(rp => rp.permission.name);
  }
}
