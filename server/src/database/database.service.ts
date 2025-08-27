import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';
import { EnvVars } from '../config/env.validation';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: sql.ConnectionPool;

  constructor(private readonly configService: ConfigService<EnvVars, true>) {}

  async onModuleInit() {
    await this.connectWithRetry();
  }

  private async connectWithRetry(): Promise<void> {
    const retryAttempts = this.configService.get('DB_RETRY_ATTEMPTS', { infer: true });
    const retryDelay = this.configService.get('DB_RETRY_DELAY', { infer: true });

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        await this.connect();
        return; // 연결 성공
      } catch (error) {
        this.logger.error(`데이터베이스 연결 실패 (시도 ${attempt}/${retryAttempts}): ${error.message}`);
        if (attempt === retryAttempts) throw error; // 최종 실패 시 에러 던지기
        await sleep(retryDelay);
      }
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.close();
      this.logger.log('데이터베이스 연결 종료');
    }
  }

  private getDbConfig(): sql.config {
    return {
      server: this.configService.get('DB_HOST', { infer: true }),
      port: this.configService.get('DB_PORT', { infer: true }),
      user: this.configService.get('DB_USERNAME', { infer: true }),
      password: this.configService.get('DB_PASSWORD', { infer: true }),
      database: this.configService.get('DB_DATABASE', { infer: true }),
      options: {
        encrypt: this.configService.get('DB_ENCRYPT', { infer: true }),
        trustServerCertificate: this.configService.get('DB_TRUST_SERVER_CERTIFICATE', {
          infer: true,
        }),
        enableArithAbort: true,
      },
      pool: {
        max: this.configService.get('DB_POOL_MAX', { infer: true }),
        min: this.configService.get('DB_POOL_MIN', { infer: true }),
        idleTimeoutMillis: 30000,
      },
      connectionTimeout: this.configService.get('DB_CONNECTION_TIMEOUT', { infer: true }),
      requestTimeout: this.configService.get('DB_REQUEST_TIMEOUT', { infer: true }),
    };
  }

  private async connect(): Promise<void> {
    const config = this.getDbConfig();
    try {
      this.logger.log(`데이터베이스 연결 중... ${config.server}:${config.port}`);

      this.pool = new sql.ConnectionPool(config);
      await this.pool.connect();

      await this.pool.request().query('SELECT 1');
      this.logger.log('데이터베이스 연결 성공');
    } catch (error) {
      throw error;
    }
  }

  /**
   * SQL 쿼리 실행
   */
  async query<T = any>(sql: string, params?: Record<string, any>): Promise<sql.IResult<T>> {
    const request = this.pool.request();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        request.input(key, value);
      });
    }

    return request.query(sql);
  }

  /**
   * 연결 상태 확인 (헬스체크용)
   */
  isHealthy(): boolean {
    return this.pool && this.pool.connected;
  }

  /**
   * ConnectionPool 직접 접근 (필요시)
   */
  getPool(): sql.ConnectionPool {
    return this.pool;
  }
}
