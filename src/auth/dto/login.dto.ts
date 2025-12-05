import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform((value: TransformFnParams) => value.value.toLowerCase().trim())
  email: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'User password',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(12, { message: 'Password must be at least 12 characters' })
  password: string;
}
