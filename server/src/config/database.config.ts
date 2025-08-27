import { registerAs } from '@nestjs/config';
import { config as sql } from 'mssql';

export default registerAs('database', () => {
  const config: sql.ConnectionPool = {
    server: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,

    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
      enableArithAbort: true, // SQL Server 성능 최적화
    },

    pool: {
      max: parseInt(process.env.DB_POOL_MAX, 10),
      min: parseInt(process.env.DB_POOL_MIN, 10),
      idleTimeoutMillis: 30000,
    },

    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10),
    requestTimeout: parseInt(process.env.DB_REQUEST_TIMEOUT, 10),
  };

  return {
    connection: config,
    schema: process.env.DB_SCHEMA,
    retryAttempts: process.env.DB_RETRY_ATTEMPTS,
    retryDelay: process.env.DB_RETRY_DELAY,
    logging: process.env.NODE_ENV === 'development',
  };
});
