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
   * 기본 헬스체크
   */
  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([() => this.mssql.isHealthy('database')]);
  }

  /**
   * 간단 liveness 체크 (DB 연결 X)
   */
  @Get('live')
  @HealthCheck()
  checkLiveness(): Promise<HealthCheckResult> {
    return this.health.check([() => Promise.resolve({ server: { status: 'up', uptime: process.uptime() } })]);
  }
}
