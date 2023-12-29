import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UserService } from '../user.service';

@ValidatorConstraint({ name: 'isUserEmailAlreadyExist', async: true })
@Injectable()
export class IsUserEmailAlreadyExist implements ValidatorConstraintInterface {
  constructor(private readonly userService: UserService) {}

  async validate(email: string): Promise<boolean> {
    const user = await this.userService.findOne({ where: { email } });
    return user === null || user === undefined;
  }

  defaultMessage(): string {
    return 'The email «$value» is already registered.';
  }
}
