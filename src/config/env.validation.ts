import { plainToInstance, Transform } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

export enum Environment {
  LOCAL = 'LOCAL',
  TESTING = 'TESTING',
  DEV = 'DEV',
  QA = 'QA',
  ALPHA = 'ALPHA',
  PROD = 'PROD',
}

export class EnvironmentVariables {
  @IsNotEmpty()
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsOptional()
  @IsIn([Environment.DEV, Environment.QA, Environment.ALPHA, Environment.PROD])
  LOCAL_ENV?:
    | Environment.DEV
    | Environment.QA
    | Environment.ALPHA
    | Environment.PROD
    | Environment.LOCAL;

  @IsNotEmpty()
  @Transform(({ value }) => Number.parseInt(value))
  @IsNumber()
  HTTP_PORT: number;

  @IsNotEmpty()
  @IsString()
  GITHUB_API_HOST: string;

  @IsNotEmpty()
  @IsString()
  API_KEY: string;
}

export function envValidate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors: any = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors?.length > 0) {
    let error = '\n\n';

    for (const err of errors) {
      Object.keys(err?.constraints ?? {}).forEach((constraint) => {
        error += `constraint ${constraint}: "${err?.constraints[constraint]}"\n`;
      });
    }

    throw new Error(error);
  }

  return validatedConfig;
}
