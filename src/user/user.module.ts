import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../core/entities/user.entity';
import { IsUserEmailAlreadyExist } from './validator/is-user-email-already-exist.validator';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, IsUserEmailAlreadyExist],
  exports: [UserService],
})
export class UsersModule {}
