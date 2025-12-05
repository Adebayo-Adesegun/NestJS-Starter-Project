import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RolesPermission } from '../core/entities/roles-permission.entity';
import { PasswordResetToken } from '../core/entities/password-reset-token.entity';

describe('AuthService - getPermissionsByRole', () => {
  let service: AuthService;
  let repo: any;

  beforeEach(async () => {
    // Mock a minimal query builder chain used in getPermissionsByRole
    const qb = {
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    };
    repo = {
      createQueryBuilder: jest.fn().mockReturnValue(qb),
      __qb: qb,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: {} },
        { provide: JwtService, useValue: { signAsync: jest.fn() } },
        { provide: getRepositoryToken(RolesPermission), useValue: repo },
        {
          provide: getRepositoryToken(PasswordResetToken),
          useValue: {
            findOne: jest.fn(),
            delete: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should return permission names from query result', async () => {
    repo.__qb.getRawMany.mockResolvedValue([
      { name: 'Read' },
      { name: 'Write' },
    ]);

    const names = await service.getPermissionsByRole(7);
    expect(names).toEqual(['Read', 'Write']);

    // Ensure the chain was called with expected arguments
    expect(repo.createQueryBuilder).toHaveBeenCalledWith('rolePermission');
    expect(repo.__qb.leftJoin).toHaveBeenCalledWith(
      'rolePermission.permission',
      'permission',
    );
    expect(repo.__qb.where).toHaveBeenCalledWith(
      'rolePermission.roleId = :roleId',
      { roleId: 7 },
    );
    expect(repo.__qb.select).toHaveBeenCalledWith('permission.name', 'name');
    expect(repo.__qb.getRawMany).toHaveBeenCalled();
  });
});
