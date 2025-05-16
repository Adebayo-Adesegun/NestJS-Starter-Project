import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Permission } from '../core/entities/permission.entity';
import { Reflector } from '@nestjs/core';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: AdminService;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: {
            getPermissions: jest.fn(),
          },
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    adminService = module.get<AdminService>(AdminService);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPermissions', () => {
    it('should return permissions successfully', async () => {
      const mockPermissions: Permission[] = [
        {
          id: 1,
          name: 'Create User',
          slug: 'create-user',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Edit User',
          slug: 'edit-user',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest
        .spyOn(adminService, 'getPermissions')
        .mockResolvedValue(mockPermissions);

      const result = await controller.getPermissions();

      expect(result).toEqual({
        message: 'Permissions fetched successfully',
        data: mockPermissions,
        statusCode: 200,
      });
      expect(adminService.getPermissions).toHaveBeenCalled();
    });

    it('should return empty array when no permissions exist', async () => {
      const mockPermissions: Permission[] = [];

      jest
        .spyOn(adminService, 'getPermissions')
        .mockResolvedValue(mockPermissions);

      const result = await controller.getPermissions();

      expect(result).toEqual({
        message: 'Permissions fetched successfully',
        data: [],
        statusCode: 200,
      });
      expect(adminService.getPermissions).toHaveBeenCalled();
    });

    it('should have proper RBAC decorators', () => {
      const roles = reflector.get('roles', controller.getPermissions);
      const permissions = reflector.get(
        'permissions',
        controller.getPermissions,
      );

      expect(roles).toEqual(['Level 1 Admin']);
      expect(permissions).toEqual(['sample-permission']);
    });

    it('should handle errors from service', async () => {
      jest
        .spyOn(adminService, 'getPermissions')
        .mockRejectedValue(new Error('Database error'));

      await expect(controller.getPermissions()).rejects.toThrow(
        'Database error',
      );
      expect(adminService.getPermissions).toHaveBeenCalled();
    });
  });
});
