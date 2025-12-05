import { plainToInstance } from 'class-transformer';
import {
  IsBooleanString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  validateSync,
} from 'class-validator';
import { Environment } from 'src/core/enums/environment.enum';

class EnvironmentVariables {
  @IsNotEmpty()
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNotEmpty()
  @IsInt()
  PORT: number;

  @IsNotEmpty()
  @IsString()
  ALLOWED_ORIGINS: string;

  @IsNotEmpty()
  @IsString()
  DATABASE_HOST: string;

  @IsNotEmpty()
  @IsInt()
  DATABASE_PORT: number;

  @IsNotEmpty()
  @IsString()
  DATABASE_USER: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(12, {
    message: 'DATABASE_PASSWORD must be at least 12 characters',
  })
  DATABASE_PASSWORD: string;

  @IsNotEmpty()
  @IsString()
  DATABASE_NAME: string;

  @IsOptional()
  @IsBooleanString()
  DATABASE_SSL?: string;

  // Mailer configuration
  @IsOptional()
  @IsString()
  MAIL_TRANSPORT?: string;

  @IsOptional()
  @IsString()
  MAIL_HOST?: string;

  @IsOptional()
  @IsInt()
  MAIL_PORT?: number;

  @IsOptional()
  @IsBooleanString()
  MAIL_SECURE?: string;

  @IsOptional()
  @IsString()
  MAIL_USER?: string;

  @IsOptional()
  @IsString()
  MAIL_PASSWORD?: string;

  @IsNotEmpty()
  @IsString()
  MAIL_FROM: string;

  @IsOptional()
  @IsBooleanString()
  MAIL_PREVIEW?: string;

  @IsOptional()
  @IsString()
  MAIL_TEMPLATE_PATH?: string;

  // JWT configuration
  @IsNotEmpty()
  @IsString()
  @MinLength(32, {
    message: 'JWT_SECRET must be at least 32 characters for security',
  })
  JWT_SECRET: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRES_IN?: string;

  @IsOptional()
  @IsString()
  JWT_REFRESH_EXPIRES_IN?: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
