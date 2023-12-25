import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEmail,
  IsISO31661Alpha2,
  IsNotEmpty,
  Matches,
  MinLength,
  Validate,
} from 'class-validator';
import { IsUserEmailAlreadyExist } from 'src/user/validator/is-user-email-already-exist.validator';

export class RegisterDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  @Transform((value: TransformFnParams) => value.value.toLowerCase())
  @Validate(IsUserEmailAlreadyExist)
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one capital letter and one number',
  })
  password: string;

  @IsNotEmpty()
  phoneNumber: string;

  @IsNotEmpty()
  @IsISO31661Alpha2({ message: 'Invalid country code' })
  countryCode: string;

  @IsNotEmpty()
  acceptTos: boolean;
}
