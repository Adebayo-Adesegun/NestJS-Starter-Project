import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, validateSync } from 'class-validator';
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

  //   @IsNotEmpty()
  //   JWT_CONSTANT: string;

  //   @IsNotEmpty()
  //   MAIL_HOST: string;

  //   @IsNotEmpty()
  //   MAIL_PORT: number;

  //   @IsNotEmpty()
  //   MAIL_FROM: string;

  //   @IsNotEmpty()
  //   MAIL_USERNAME: string;

  //   @IsNotEmpty()
  //   MAIL_PASSWORD: string;
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
