import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';

enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

enum LogLevel {
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
}

export class EnvVars {
  @IsEnum(NodeEnv, { message: 'NODE_ENV는 development, production, test 중 하나여야 합니다.' })
  @IsOptional()
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @IsInt({ message: 'PORT는 숫자여야 합니다.' })
  @Min(1, { message: 'PORT는 1 이상의 숫자여야 합니다.' })
  @Max(65535, { message: 'PORT는 65535 이하의 숫자여야 합니다.' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  PORT: number = 3001;

  @IsOptional()
  @Transform(({ value }) => value.split(',').map((s: string) => s.trim()))
  ALLOWED_ORIGINS: string[] = ['http://localhost:3000'];

  // --- Database ---
  @IsString()
  DB_HOST: string;

  @IsInt({ message: 'DB_PORT는 숫자여야 합니다.' })
  @Min(1, { message: 'DB_PORT는 1 이상의 숫자여야 합니다.' })
  @Max(65535, { message: 'DB_PORT는 65535 이하의 숫자여야 합니다.' })
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_DATABASE: string;

  @IsString()
  @IsOptional()
  DB_SCHEMA: string = 'dbo';

  @IsInt({ message: 'DB_CONNECTION_TIMEOUT은 숫자여야 합니다.' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  DB_CONNECTION_TIMEOUT: number = 30000;

  @IsInt({ message: 'DB_REQUEST_TIMEOUT은 숫자여야 합니다.' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  DB_REQUEST_TIMEOUT: number = 30000;

  @IsInt({ message: 'DB_POOL_MIN은 숫자여야 합니다.' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  DB_POOL_MIN: number = 5;

  @IsInt({ message: 'DB_POOL_MAX는 숫자여야 합니다.' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  DB_POOL_MAX: number = 20;

  @IsBoolean({ message: 'DB_ENCRYPT는 true 또는 false여야 합니다.' })
  @Transform(({ value }) => value === 'true', { toClassOnly: true })
  DB_ENCRYPT: boolean;

  @IsBoolean({ message: 'DB_TRUST_SERVER_CERTIFICATE는 true 또는 false여야 합니다.' })
  @Transform(({ value }) => value === 'true', { toClassOnly: true })
  DB_TRUST_SERVER_CERTIFICATE: boolean;

  @IsInt({ message: 'DB_RETRY_ATTEMPTS는 숫자여야 합니다.' })
  @Min(1, { message: 'DB_RETRY_ATTEMPTS는 1 이상이어야 합니다.' })
  @Max(10, { message: 'DB_RETRY_ATTEMPTS는 10 이하를 권장합니다.' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  DB_RETRY_ATTEMPTS: number = 3;

  @IsInt({ message: 'DB_RETRY_DELAY는 숫자여야 합니다.' })
  @Min(1000, { message: 'DB_RETRY_DELAY는 1000ms 이상을 권장합니다.' })
  @Max(30000, { message: 'DB_RETRY_DELAY는 30초 이하를 권장합니다.' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  DB_RETRY_DELAY: number = 3000;

  // --- JWT ---
  @IsString()
  @MinLength(32, {
    message: 'Production 환경에서는 JWT_SECRET이 32자 이상이어야 합니다.',
    groups: [NodeEnv.Production],
  })
  @MinLength(16, {
    message: 'JWT_SECRET은 16자 이상을 권장합니다.',
    groups: [NodeEnv.Development, NodeEnv.Test],
  })
  JWT_SECRET: string;

  @IsString()
  @Matches(/^\d+[hdwmy]$/, { message: 'JWT_EXPIRES_IN 형식이 올바르지 않습니다 (예: 24h, 7d).' })
  @IsOptional()
  JWT_EXPIRES_IN: string = '24h';

  // --- Logging ---
  @IsEnum(LogLevel, { message: 'LOG_LEVEL은 error, warn, info, debug 중 하나여야 합니다.' })
  @IsOptional()
  LOG_LEVEL: LogLevel = LogLevel.Info;
}

export function validate(config: Record<string, unknown>) {
  const envVars = plainToInstance(EnvVars, config, {
    // 모든 타입 변환을 @Transform으로 명시하므로 implicit conversion은 비활성화합니다.
    enableImplicitConversion: false,
  });

  const errors = validateSync(envVars, {
    skipMissingProperties: false,
    groups: [envVars.NODE_ENV],
  });

  if (errors.length > 0) {
    const errorMsgs = errors.map((error) => Object.values(error.constraints || {})).flat();
    throw new Error(`[환경변수 검증 실패]\n- ${errorMsgs.join('\n- ')}`);
  }

  // 성공 로그
  console.log('\n환경변수 검증 완료');
  console.log(`Database: ${envVars.DB_HOST}:${envVars.DB_PORT}/${envVars.DB_DATABASE}`);
  console.log(`Environment: ${envVars.NODE_ENV}`);
  console.log(`JWT 보안 수준: ${envVars.JWT_SECRET.length >= 32 ? '강함 (32자+)' : '보통 (16자+)'}`);

  return envVars;
}
