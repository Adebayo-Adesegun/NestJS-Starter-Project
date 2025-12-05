import { IsString } from 'class-validator';
import { IsStrongPassword } from '../../user/validator/strong-password.validator';

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @IsStrongPassword({
    message: 'New password does not meet strength requirements',
  })
  newPassword: string;
}
