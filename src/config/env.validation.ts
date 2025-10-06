import { plainToInstance } from 'class-transformer';
import { IsBooleanString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';
import { Environment } from 'src/core/enums/environment.enum';

class EnvironmentVariables {
  @IsNotEmpty()
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNotEmpty()
  PORT: number;

  @IsNotEmpty()
  ALLOWED_ORIGINS: string;

  @IsNotEmpty()
  DATABASE_HOST: string;

  @IsNotEmpty()
  DATABASE_PORT: number;

  @IsNotEmpty()
  DATABASE_USER: string;

  @IsNotEmpty()
  DATABASE_PASSWORD: string;

  @IsNotEmpty()
  DATABASE_NAME: string;

  // Mailer configuration
  @IsOptional()
  @IsString()
  MAIL_TRANSPORT?: string; // optional full transport URL

  @IsOptional()
  @IsString()
  MAIL_HOST?: string;

  @IsOptional()
  @IsNumber()
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
  MAIL_PREVIEW?: string; // if true, don't send, just log/preview

  @IsOptional()
  @IsString()
  MAIL_TEMPLATE_PATH?: string;
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
