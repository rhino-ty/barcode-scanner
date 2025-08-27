import { Global, Module, Provider, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';
import { EnvVars } from '../config/env.validation';
import { DatabaseService } from './database.service';

export const DB_CONNECTION = 'DB_CONNECTION';

const databaseProvider: Provider = {
  provide: DB_CONNECTION,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService<EnvVars, true>): Promise<sql.ConnectionPool> => {
    const logger = new Logger('DatabaseModule');

    const dbConfig: sql.config = {
      server: configService.get('DB_HOST', { infer: true }),
      port: configService.get('DB_PORT', { infer: true }),
      user: configService.get('DB_USERNAME', { infer: true }),
      password: configService.get('DB_PASSWORD', { infer: true }),
      database: configService.get('DB_DATABASE', { infer: true }),
      options: {
        encrypt: configService.get('DB_ENCRYPT', { infer: true }),
        trustServerCertificate: configService.get('DB_TRUST_SERVER_CERTIFICATE', { infer: true }),
        enableArithAbort: true,
      },
      pool: {
        max: configService.get('DB_POOL_MAX', { infer: true }),
        min: configService.get('DB_POOL_MIN', { infer: true }),
        idleTimeoutMillis: 30000,
      },
      connectionTimeout: configService.get('DB_CONNECTION_TIMEOUT', { infer: true }),
      requestTimeout: configService.get('DB_REQUEST_TIMEOUT', { infer: true }),
    };

    try {
      const pool = new sql.ConnectionPool(dbConfig);

      // 연결 이벤트 리스너 추가
      pool.on('connect', () => {
        logger.log(`데이터베이스 연결 성공: ${dbConfig.server}:${dbConfig.port}/${dbConfig.database}`);
      });

      pool.on('close', () => {
        logger.warn('데이터베이스 연결이 닫혔습니다');
      });

      pool.on('error', (err) => {
        logger.error('데이터베이스 연결 오류:', err.message);
      });

      // 연결 시도
      logger.log(`데이터베이스 연결 중... ${dbConfig.server}:${dbConfig.port}`);
      const connection = await pool.connect();

      // 연결 테스트 쿼리
      const testResult = await connection.request().query('SELECT GETDATE() as currentTime');
      logger.log(`연결 테스트 성공. 서버 시간: ${testResult.recordset[0].currentTime}`);

      return connection;
    } catch (err) {
      logger.error('데이터베이스 연결 실패:', err.message);
      logger.error('연결 정보:', {
        server: dbConfig.server,
        port: dbConfig.port,
        database: dbConfig.database,
        encrypt: dbConfig.options.encrypt,
      });
      throw err;
    }
  },
};

@Global()
@Module({
  providers: [databaseProvider, DatabaseService],
  exports: [DatabaseService, DB_CONNECTION], // DB_CONNECTION도 export (필요시 직접 접근 가능)
})
export class DatabaseModule {}
