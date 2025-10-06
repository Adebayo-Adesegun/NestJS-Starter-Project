import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Permission } from '../core/entities/permission.entity';
import { UserRole } from '../core/entities/user-role.entity';
import { RolesPermission } from '../core/entities/roles-permission.entity';

describe('AdminService', () => {
  let service: AdminService;
  let permissionRepo: { find: jest.Mock };
  let userRoleRepo: { find: jest.Mock };
  let rolesPermissionRepo: { find: jest.Mock };

  beforeEach(async () => {
    permissionRepo = { find: jest.fn() };
    userRoleRepo = { find: jest.fn() };
    rolesPermissionRepo = { find: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Permission),
          useValue: permissionRepo,
        },
        {
          provide: getRepositoryToken(UserRole),
          useValue: userRoleRepo,
        },
        {
          provide: getRepositoryToken(RolesPermission),
          useValue: rolesPermissionRepo,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getPermissions should return list from repository', async () => {
    const permissions = [
      { id: 1, name: 'Create User', slug: 'create-user' },
      { id: 2, name: 'Edit User', slug: 'edit-user' },
    ] as any;
    permissionRepo.find.mockResolvedValue(permissions);

    const result = await service.getPermissions();
    expect(result).toBe(permissions);
    expect(permissionRepo.find).toHaveBeenCalledTimes(1);
  });

  it('getUserRoles should query by user and include relation', async () => {
    const roles = [{ id: 1 }, { id: 2 }] as any;
    userRoleRepo.find.mockResolvedValue(roles);

    const result = await service.getUserRoles(5);
    expect(result).toBe(roles);
    expect(userRoleRepo.find).toHaveBeenCalledWith({
      where: { user: { id: 5 } },
      relations: ['role'],
    });
  });

  it('getPermissionsByRole should map permission names', async () => {
    const data = [
      { permission: { name: 'Read' } },
      { permission: { name: 'Write' } },
    ] as any;
    rolesPermissionRepo.find.mockResolvedValue(data);

    const result = await service.getPermissionsByRole(2);
    expect(result).toEqual(['Read', 'Write']);
    expect(rolesPermissionRepo.find).toHaveBeenCalledWith({
      where: { role: { id: 2 } },
      relations: ['permission'],
    });
  });
});
