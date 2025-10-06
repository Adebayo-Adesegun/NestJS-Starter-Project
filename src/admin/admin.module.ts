import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Permission } from '../core/entities/permission.entity';
import { UserRole } from '../core/entities/user-role.entity';
import { RolesPermission } from '../core/entities/roles-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, UserRole, RolesPermission])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
