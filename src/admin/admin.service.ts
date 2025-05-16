import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Permission } from '../core/entities/permission.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async getPermissions(): Promise<Permission[]> {
    return await this.permissionRepository.find();
  }
}
