import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { EnvVars } from './config/env.validation';

async function bootstrap() {
  // NestJS 앱 생성
  const app = await NestFactory.create(AppModule);

  // config 생성
  const config = app.get<ConfigService<EnvVars, true>>(ConfigService);

  // 로거 설정
  const nodeEnv = config.get('NODE_ENV', { infer: true });
  app.useLogger(nodeEnv === 'development' ? ['error', 'warn', 'log', 'debug'] : ['error', 'warn', 'log']);

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
  console.log(`Server running on http://localhost:${port}`);
  console.log(`API available at http://localhost:${port}/api`);
  console.log(`Health check: http://localhost:${port}/api/health`);

  if (nodeEnv === 'development') {
    console.log(`Products API: http://localhost:${port}/api/products`);
  }
}

// 에러 핸들링
bootstrap().catch((error) => {
  console.error('서버 시작 실패:', error.message);
  process.exit(1);
});
