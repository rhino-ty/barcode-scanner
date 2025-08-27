import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MssqlHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(MssqlHealthIndicator.name);

  constructor(private readonly databaseService: DatabaseService) {
    super();
  }

  /**
   * 기본 헬스체크
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const startTime = Date.now();

    try {
      // 1. 먼저 빠른 연결 상태 체크
      if (!this.databaseService.isHealthy()) {
        throw new Error('Connection pool is not healthy');
      }

      // 2. DatabaseService의 헬스체크 메서드 활용
      const healthResult = await this.databaseService.healthCheck();
      const responseTime = Date.now() - startTime;

      return this.getStatus(key, true, {
        status: 'up',
        responseTime: `${responseTime}ms`,
        server: healthResult.serverInfo,
        timestamp: healthResult.timestamp,
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;

      this.logger.warn(`Database health check failed (${responseTime}ms): ${error.message}`);

      throw new HealthCheckError(
        'MSSQL health check failed',
        this.getStatus(key, false, {
          status: 'down',
          message: error.message,
          responseTime: `${responseTime}ms`,
        }),
      );
    }
  }

  /**
   * 상세 헬스체크: 필요할 때만 사용하는 옵션
   */
  async detailedCheck(key: string, options?: { timeout?: number }): Promise<HealthIndicatorResult> {
    const timeout = options?.timeout || 3000;
    const startTime = Date.now();

    try {
      // 연결 상태 먼저 확인 (빠른 실패)
      if (!this.databaseService.isHealthy()) {
        throw new Error('Connection pool is not healthy');
      }

      // 타임아웃 적용한 쿼리 실행
      const result = await Promise.race([
        this.databaseService.query('SELECT GETDATE() as serverTime, @@SERVERNAME as serverName'),
        this.createTimeoutPromise(timeout),
      ]);

      const responseTime = Date.now() - startTime;
      const serverInfo = result.recordset[0];

      return this.getStatus(key, true, {
        status: 'up',
        responseTime: `${responseTime}ms`,
        server: {
          name: serverInfo.serverName,
          time: serverInfo.serverTime,
        },
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;

      this.logger.error(`Database detailed check failed (${responseTime}ms): ${error.message}`);

      throw new HealthCheckError(
        'MSSQL detailed check failed',
        this.getStatus(key, false, {
          status: 'down',
          message: error.message,
          responseTime: `${responseTime}ms`,
          threshold: `${timeout}ms`,
        }),
      );
    }
  }

  /**
   * 타임아웃 Promise 생성 유틸리티
   */
  private createTimeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    });
  }
}
