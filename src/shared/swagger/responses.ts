import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from './error-schema';

export const ApiStandardErrors = () =>
  applyDecorators(
    ApiBadRequestResponse({
      description: 'Bad Request',
      type: ErrorResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      type: ErrorResponseDto,
    }),
    ApiForbiddenResponse({
      description: 'Forbidden',
      type: ErrorResponseDto,
    }),
    ApiNotFoundResponse({
      description: 'Not Found',
      type: ErrorResponseDto,
    }),
  );
