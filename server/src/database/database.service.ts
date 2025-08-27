import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as sql from 'mssql';
import { DB_CONNECTION } from './database.module';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@Inject(DB_CONNECTION) private readonly pool: sql.ConnectionPool) {}

  async onModuleDestroy() {
    try {
      await this.pool.close();
      this.logger.log('데이터베이스 연결이 정상적으로 종료되었습니다');
    } catch (error) {
      this.logger.error('데이터베이스 연결 종료 중 오류 발생:', error.message);
    }
  }

  /**
   * ConnectionPool 직접 접근 (기존 코드 호환성)
   */
  getPool(): sql.ConnectionPool {
    return this.pool;
  }

  /**
   * SQL 쿼리 실행 (편의성 향상)
   */
  async query<T = any>(sqlQuery: string, params?: Record<string, any>): Promise<sql.IResult<T>> {
    const startTime = Date.now();

    try {
      const request = this.pool.request();

      // 파라미터 바인딩
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          request.input(key, value);
        });
      }

      const result = await request.query(sqlQuery);
      const duration = Date.now() - startTime;

      // 개발 환경에서만 쿼리 로그
      if (process.env.NODE_ENV === 'development') {
        this.logger.debug(`쿼리 실행 완료 (${duration}ms): ${sqlQuery.substring(0, 100)}...`);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`쿼리 실행 실패 (${duration}ms): ${error.message}`);
      this.logger.error(`SQL: ${sqlQuery}`);
      if (params) this.logger.error(`Params: ${JSON.stringify(params)}`);
      throw error;
    }
  }

  /**
   * 단일 레코드 조회 (편의 메서드)
   */
  async findOne<T = any>(sqlQuery: string, params?: Record<string, any>): Promise<T | null> {
    const result = await this.query<T>(sqlQuery, params);
    return result.recordset && result.recordset.length > 0 ? result.recordset[0] : null;
  }

  /**
   * 여러 레코드 조회 (편의 메서드)
   */
  async findMany<T = any>(sqlQuery: string, params?: Record<string, any>): Promise<T[]> {
    const result = await this.query<T>(sqlQuery, params);
    return result.recordset || [];
  }

  /**
   * INSERT/UPDATE/DELETE 실행 (편의 메서드)
   */
  async execute(sqlQuery: string, params?: Record<string, any>): Promise<number> {
    const result = await this.query(sqlQuery, params);
    return result.rowsAffected[0] || 0;
  }

  /**
   * 트랜잭션 실행
   */
  async transaction<T>(callback: (request: sql.Request) => Promise<T>): Promise<T> {
    const transaction = new sql.Transaction(this.pool);

    try {
      await transaction.begin();
      const request = transaction.request();

      const result = await callback(request);

      await transaction.commit();
      this.logger.debug('트랜잭션 커밋 성공');

      return result;
    } catch (error) {
      await transaction.rollback();
      this.logger.error('트랜잭션 롤백:', error.message);
      throw error;
    }
  }

  /**
   * 연결 상태 확인 (헬스체크용)
   */
  isHealthy(): boolean {
    return this.pool && this.pool.connected;
  }

  /**
   * 헬스체크용 간단한 쿼리
   */
  async healthCheck(): Promise<{ status: string; timestamp: Date; serverInfo?: string }> {
    try {
      const result = await this.findOne(`
        SELECT 
          GETDATE() as timestamp,
          @@SERVERNAME as serverName,
          DB_NAME() as databaseName
      `);

      return {
        status: 'healthy',
        timestamp: result.timestamp,
        serverInfo: `${result.serverName}/${result.databaseName}`,
      };
    } catch (error) {
      throw new Error(`헬스체크 실패: ${error.message}`);
    }
  }

  /**
   * 연결 정보 조회 (디버깅용)
   */
  getConnectionInfo(): {
    server: string;
    database: string;
    connected: boolean;
    connecting: boolean;
  } {
    return {
      server: this.pool.config.server || 'unknown',
      database: this.pool.config.database || 'unknown',
      connected: this.pool.connected,
      connecting: this.pool.connecting,
    };
  }
}
