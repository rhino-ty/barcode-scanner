import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../database/database.service';
import { ScanLog } from './scan-log.entity';
import { User } from '../user/user.entity';
import { CreateScanLogDto, GetScanLogsQueryDto, GetScanStatsQueryDto } from './dto/scan-log.dto';

@Injectable()
export class ScanLogsService {
  private readonly logger = new Logger(ScanLogsService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * 스캔 로그 생성
   */
  async createScanLog(
    createScanLogDto: CreateScanLogDto,
    user: Partial<User>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ScanLog> {
    try {
      const pool = this.databaseService.getPool();

      const result = await pool
        .request()
        .input('userId', sql.Int, user.userId || null)
        .input('username', sql.NVarChar(50), user.username || null)
        .input('fullName', sql.NVarChar(100), user.fullName || null)
        .input('teamCode', sql.NVarChar(50), user.teamCode || null)
        .input('teamName', sql.NVarChar(100), user.teamName || null)
        .input('scannedBarcode', sql.NVarChar(200), createScanLogDto.scannedBarcode)
        .input('scanResult', sql.NVarChar(20), createScanLogDto.scanResult)
        .input('errorMessage', sql.NVarChar(200), createScanLogDto.errorMessage || null)
        .input('ipAddress', sql.NVarChar(45), ipAddress || null)
        .input('deviceInfo', sql.NVarChar(100), createScanLogDto.deviceInfo || null).query`
          INSERT INTO ScanLogs 
            (userId, username, fullName, teamName, scannedBarcode, scanResult, errorMessage, ipAddress, deviceInfo, userAgent) 
          OUTPUT INSERTED.*
          VALUES 
            (@userId, @username, @fullName, @teamName, @scannedBarcode, @scanResult, @errorMessage, @ipAddress, @deviceInfo, @userAgent)
        `;

      const createdLog = result.recordset[0] as ScanLog;

      this.logger.log(
        `스캔 로그 생성: ${user.username} - ${createScanLogDto.scannedBarcode} (${createScanLogDto.scanResult})`,
      );

      return createdLog;
    } catch (error) {
      this.logger.error(`스캔 로그 생성 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 스캔 로그 목록 조회 (페이지네이션)
   */
  async findScanLogs(query: GetScanLogsQueryDto): Promise<{
    logs: ScanLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const pool = this.databaseService.getPool();

      const offset = (query.page - 1) * query.limit;

      // 동적 WHERE 조건 생성
      let whereConditions = ['1=1']; // 기본 조건
      const request = pool.request().input('limit', sql.Int, query.limit).input('offset', sql.Int, offset);

      if (query.username) {
        whereConditions.push('username = @username');
        request.input('username', sql.NVarChar(50), query.username);
      }

      if (query.teamName) {
        whereConditions.push('teamName = @teamName');
        request.input('teamName', sql.NVarChar(100), query.teamName);
      }

      if (query.scanResult) {
        whereConditions.push('scanResult = @scanResult');
        request.input('scanResult', sql.NVarChar(20), query.scanResult);
      }

      if (query.startDate) {
        whereConditions.push('CAST(scannedAt AS DATE) >= @startDate');
        request.input('startDate', sql.Date, query.startDate);
      }

      if (query.endDate) {
        whereConditions.push('CAST(scannedAt AS DATE) <= @endDate');
        request.input('endDate', sql.Date, query.endDate);
      }

      if (query.barcode) {
        whereConditions.push('scannedBarcode LIKE @barcode');
        request.input('barcode', sql.NVarChar(200), `%${query.barcode}%`);
      }

      const whereClause = whereConditions.join(' AND ');

      // 총 개수 조회
      const countResult = await request.query(`
        SELECT COUNT(*) as total 
        FROM ScanLogs 
        WHERE ${whereClause}
      `);
      const total = countResult.recordset[0].total;

      // 페이지네이션된 결과 조회
      const logsResult = await request.query(`
        SELECT * FROM ScanLogs 
        WHERE ${whereClause}
        ORDER BY scannedAt DESC
        OFFSET @offset ROWS 
        FETCH NEXT @limit ROWS ONLY
      `);

      const logs = logsResult.recordset as ScanLog[];
      const totalPages = Math.ceil(total / query.limit);

      return {
        logs,
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error(`스캔 로그 조회 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 스캔 로그 상세 조회
   */
  async findScanLogById(logId: number): Promise<ScanLog> {
    try {
      const pool = this.databaseService.getPool();

      const result = await pool
        .request()
        .input('logId', sql.BigInt, logId)
        .query('SELECT * FROM ScanLogs WHERE logId = @logId');

      const log = result.recordset[0] as ScanLog;

      if (!log) {
        throw new NotFoundException(`스캔 로그를 찾을 수 없습니다. ID: ${logId}`);
      }

      return log;
    } catch (error) {
      this.logger.error(`스캔 로그 상세 조회 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 스캔 통계 조회
   */
  async getScanStats(query: GetScanStatsQueryDto): Promise<any> {
    try {
      const pool = this.databaseService.getPool();

      // 기간별 WHERE 조건
      let dateCondition = '';
      switch (query.period) {
        case 'today':
          dateCondition = 'CAST(scannedAt AS DATE) = CAST(GETDATE() AS DATE)';
          break;
        case 'week':
          dateCondition = 'scannedAt >= DATEADD(DAY, -7, GETDATE())';
          break;
        case 'month':
          dateCondition = 'scannedAt >= DATEADD(MONTH, -1, GETDATE())';
          break;
        case 'year':
          dateCondition = 'scannedAt >= DATEADD(YEAR, -1, GETDATE())';
          break;
        default:
          dateCondition = '1=1';
      }

      // 그룹화 기준별 SELECT 및 GROUP BY 절
      let selectClause = '';
      let groupByClause = '';

      switch (query.groupBy) {
        case 'user':
          selectClause = 'username, fullName, teamName';
          groupByClause = 'username, fullName, teamName';
          break;
        case 'team':
          selectClause = 'teamName';
          groupByClause = 'teamName';
          break;
        case 'hour':
          selectClause = 'DATEPART(HOUR, scannedAt) as hour';
          groupByClause = 'DATEPART(HOUR, scannedAt)';
          break;
        case 'day':
          selectClause = 'CAST(scannedAt AS DATE) as date';
          groupByClause = 'CAST(scannedAt AS DATE)';
          break;
        default:
          selectClause = 'username, fullName, teamName';
          groupByClause = 'username, fullName, teamName';
      }

      const statsResult = await pool.request().query(`
        SELECT 
          ${selectClause},
          COUNT(*) as totalScans,
          COUNT(CASE WHEN scanResult = 'success' THEN 1 END) as successScans,
          COUNT(CASE WHEN scanResult = 'failed' THEN 1 END) as failedScans,
          ROUND(
            CAST(COUNT(CASE WHEN scanResult = 'success' THEN 1 END) AS FLOAT) / 
            CAST(COUNT(*) AS FLOAT) * 100, 2
          ) as successRate
        FROM ScanLogs 
        WHERE ${dateCondition}
        GROUP BY ${groupByClause}
        ORDER BY totalScans DESC
      `);

      // 전체 요약 통계
      const summaryResult = await pool.request().query(`
        SELECT 
          COUNT(*) as totalScans,
          COUNT(CASE WHEN scanResult = 'success' THEN 1 END) as successScans,
          COUNT(CASE WHEN scanResult = 'failed' THEN 1 END) as failedScans,
          COUNT(DISTINCT username) as uniqueUsers,
          COUNT(DISTINCT teamName) as uniqueTeams,
          ROUND(
            CAST(COUNT(CASE WHEN scanResult = 'success' THEN 1 END) AS FLOAT) / 
            CAST(COUNT(*) AS FLOAT) * 100, 2
          ) as overallSuccessRate
        FROM ScanLogs 
        WHERE ${dateCondition}
      `);

      return {
        period: query.period,
        groupBy: query.groupBy,
        summary: summaryResult.recordset[0],
        details: statsResult.recordset,
      };
    } catch (error) {
      this.logger.error(`스캔 통계 조회 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 사용자별 최근 스캔 이력 조회
   */
  async getRecentScansByUser(userId: number, limit: number = 10): Promise<ScanLog[]> {
    try {
      const pool = this.databaseService.getPool();

      const result = await pool.request().input('userId', sql.Int, userId).input('limit', sql.Int, limit).query(`
          SELECT TOP (@limit) * 
          FROM ScanLogs 
          WHERE userId = @userId 
          ORDER BY scannedAt DESC
        `);

      return result.recordset as ScanLog[];
    } catch (error) {
      this.logger.error(`사용자별 스캔 이력 조회 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 특정 바코드의 스캔 이력 조회
   */
  async getScansByBarcode(barcode: string, limit: number = 50): Promise<ScanLog[]> {
    try {
      const pool = this.databaseService.getPool();

      const result = await pool.request().input('barcode', sql.NVarChar(200), barcode).input('limit', sql.Int, limit)
        .query(`
          SELECT TOP (@limit) * 
          FROM ScanLogs 
          WHERE scannedBarcode = @barcode 
          ORDER BY scannedAt DESC
        `);

      return result.recordset as ScanLog[];
    } catch (error) {
      this.logger.error(`바코드별 스캔 이력 조회 실패: ${error.message}`);
      throw error;
    }
  }
}
