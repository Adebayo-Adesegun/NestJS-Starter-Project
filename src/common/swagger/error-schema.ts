import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodes, type ErrorCode } from '../errors/error-codes';

export class ErrorResponseDto<T = unknown> {
  @ApiProperty({ example: false })
  success!: false;

  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ enum: Object.values(ErrorCodes) })
  code!: ErrorCode;

  @ApiProperty({ example: 'Validation failed' })
  message!: string | T;

  @ApiProperty({ example: '/api/v1/auth/login' })
  path!: string;

  @ApiProperty({ example: 'POST' })
  method!: string;

  @ApiProperty({ example: new Date().toISOString() })
  timestamp!: string;
}
