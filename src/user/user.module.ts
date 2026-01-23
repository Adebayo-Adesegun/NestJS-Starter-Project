import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../core/entities/user.entity';
import { IsUserEmailAlreadyExist } from './validator/is-user-email-already-exist.validator';
import { DateModule } from '../common/date/date.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), DateModule],
  providers: [UserService, IsUserEmailAlreadyExist],
  exports: [UserService],
})
export class UsersModule {}
