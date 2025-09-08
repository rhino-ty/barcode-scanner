import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { EnvVars } from './config/env.validation';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // NestJS 앱 생성
  const app = await NestFactory.create(AppModule);

  // config 생성
  const config = app.get<ConfigService<EnvVars, true>>(ConfigService);

  // 로거 설정
  const nodeEnv = config.get('NODE_ENV', { infer: true });
  app.useLogger(nodeEnv === 'development' ? ['error', 'warn', 'log', 'debug'] : ['error', 'warn', 'log']);

  // 글로벌 ValidationPipe 설정
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 정의되지 않은 속성 제거
      forbidNonWhitelisted: true, // 정의되지 않은 속성 발견시 에러
      transform: true, // 자동 타입 변환
      // disableErrorMessages: nodeEnv === 'production', // 프로덕션에서 상세 에러 숨김
      validateCustomDecorators: true,
    }),
  );

  // 전역 예외 필터 적용
  app.useGlobalFilters(new GlobalExceptionFilter());

  // CORS 설정
  app.enableCors({
    origin: config.get('ALLOWED_ORIGINS', { infer: true }),
    credentials: true,
  });

  // API prefix 설정
  app.setGlobalPrefix('api');

  const port = config.get('PORT', { infer: true });

  // 서버 시작
  await app.listen(port);

  // 시작 메시지
  logger.log(`Server running on - http://localhost:${port}`);
  logger.log(`API available at - http://localhost:${port}/api`);
  logger.log(`Health check - http://localhost:${port}/api/health`);

  if (nodeEnv === 'development') {
    logger.log(`Authentication API - http://localhost:${port}/api/auth/login`);
    logger.log(`Profile API - http://localhost:${port}/api/auth/profile`);
  }
}

// 에러 핸들링
bootstrap().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
