import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @Transform((value: TransformFnParams) => value.value.toLowerCase())
  email: string;

  @IsNotEmpty()
  password: string;
}
