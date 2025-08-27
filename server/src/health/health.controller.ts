import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HealthCheckResult } from '@nestjs/terminus';
import { MssqlHealthIndicator } from './mssql-health.indicator';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mssql: MssqlHealthIndicator,
  ) {}

  /**
   * 기본 헬스체크 - 원본의 심플함 유지
   */
  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([() => this.mssql.isHealthy('database')]);
  }

  /**
   * 상세 헬스체크 - 운영/디버깅용 (옵션)
   */
  @Get('detailed')
  @HealthCheck()
  checkDetailed(): Promise<HealthCheckResult> {
    return this.health.check([() => this.mssql.detailedCheck('database', { timeout: 5000 })]);
  }

  /**
   * Kubernetes 등을 위한 간단한 liveness 체크
   */
  @Get('live')
  @HealthCheck()
  checkLiveness(): Promise<HealthCheckResult> {
    return this.health.check([
      // 단순히 서버가 살아있는지만 체크 (DB 체크 X)
      () => Promise.resolve(this.getSimpleStatus('server', true, { uptime: process.uptime() })),
    ]);
  }

  /**
   * Kubernetes 등을 위한 readiness 체크
   */
  @Get('ready')
  @HealthCheck()
  checkReadiness(): Promise<HealthCheckResult> {
    return this.health.check([
      // DB 연결되어야 요청 처리 준비 완료
      () => this.mssql.isHealthy('database'),
    ]);
  }

  /**
   * 간단한 상태 응답 생성 헬퍼
   */
  private getSimpleStatus(key: string, isHealthy: boolean, data?: any) {
    return {
      [key]: {
        status: isHealthy ? 'up' : 'down',
        ...data,
      },
    };
  }
}
