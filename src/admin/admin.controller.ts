import { Controller, Get, SetMetadata } from '@nestjs/common';
import { Permission } from '../core/entities/permission.entity';
import { ApiBaseResponse } from '../core/interfaces/api-response.interface';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('/user/permission')
  /**
   * Sample documentation of working with RBAC
   * This specifies the allowed roles and permissions on ti
   */
  @SetMetadata('roles', ['Level 1 Admin'])
  @SetMetadata('permissions', ['sample-permission'])
  async getPermissions(): Promise<ApiBaseResponse<Permission[]>> {
    const response = await this.adminService.getPermissions();
    return {
      statusCode: 200,
      message: 'Permissions fetched successfully',
      data: response,
    };
  }
}
