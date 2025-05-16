import { Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Entity({ name: 'roles_permission' })
export class RolesPermission extends BaseEntity {
  @ManyToOne(() => Role)
  role: Role;

  @ManyToOne(() => Permission)
  permission: Permission;
}
