import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { MssqlHealthIndicator } from './mssql-health.indicator';

@Module({
  imports: [
    TerminusModule.forRoot({
      // 옵션: Terminus 글로벌 설정
      errorLogStyle: 'pretty', // 개발시 예쁜 에러 로그
      gracefulShutdownTimeoutMs: 1000, // 1초 graceful shutdown
    }),
  ],
  controllers: [HealthController],
  providers: [MssqlHealthIndicator],
  exports: [MssqlHealthIndicator], // 다른 모듈에서 재사용 가능
})
export class HealthModule {}
