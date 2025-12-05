import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEmail,
  IsISO31661Alpha2,
  IsNotEmpty,
  MinLength,
  Validate,
} from 'class-validator';
import { IsUserEmailAlreadyExist } from '../../user/validator/is-user-email-already-exist.validator';
import { IsStrongPassword } from '../../user/validator/strong-password.validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  firstName: string;

  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  lastName: string;

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform((value: TransformFnParams) => value.value.toLowerCase().trim())
  @Validate(IsUserEmailAlreadyExist)
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsStrongPassword()
  password: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  phoneNumber: string;

  @IsNotEmpty({ message: 'Country code is required' })
  @IsISO31661Alpha2({ message: 'Invalid ISO 3166-1 alpha-2 country code' })
  countryCode: string;

  @IsNotEmpty({ message: 'You must accept the terms of service' })
  acceptTos: boolean;
}
