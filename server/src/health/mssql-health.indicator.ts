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
   * 데이터베이스 헬스체크
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const startTime = Date.now();

    try {
      // 1. 연결 상태 빠른 체크
      if (!this.databaseService.isHealthy()) {
        throw new Error('Database connection is not healthy');
      }

      // 2. 실제 쿼리 테스트
      await this.databaseService.query('SELECT 1');

      const responseTime = Date.now() - startTime;

      return this.getStatus(key, true, {
        status: 'up',
        responseTime: `${responseTime}ms`,
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;

      this.logger.warn(`Database health check failed (${responseTime}ms): ${error.message}`);

      throw new HealthCheckError(
        'Database health check failed',
        this.getStatus(key, false, {
          status: 'down',
          message: error.message,
          responseTime: `${responseTime}ms`,
        }),
      );
    }
  }
}
