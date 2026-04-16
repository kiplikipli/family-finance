import { plainToInstance } from 'class-transformer';
import { IsString, IsNumber, validateSync, IsOptional } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  DATABASE_HOST: string;

  @IsNumber()
  DATABASE_PORT: number;

  @IsString()
  DATABASE_USERNAME: string;

  @IsString()
  DATABASE_PASSWORD: string;

  @IsString()
  DATABASE_NAME: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRATION: string;

  @IsString()
  @IsOptional()
  JWT_REFRESH_EXPIRATION: string;

  @IsString()
  @IsOptional()
  REDIS_HOST: string;

  @IsNumber()
  @IsOptional()
  REDIS_PORT: number;

  @IsString()
  @IsOptional()
  S3_ENDPOINT: string;

  @IsString()
  @IsOptional()
  S3_BUCKET: string;

  @IsString()
  @IsOptional()
  S3_ACCESS_KEY: string;

  @IsString()
  @IsOptional()
  S3_SECRET_KEY: string;

  @IsString()
  @IsOptional()
  S3_REGION: string;

  @IsNumber()
  @IsOptional()
  PORT: number;
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
