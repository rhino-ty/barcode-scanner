import { Injectable, Logger } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../database/database.service';
import { ScanLogsService } from '../scan-logs/scan-logs.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly scanLogsService: ScanLogsService, // 기존 서비스 재사용
  ) {}

  /**
   * 대시보드 통계 조회
   */
  async getDashboardStats() {
    try {
      const pool = this.databaseService.getPool();

      // 병렬로 모든 통계 조회 (기존 패턴 따라함)
      const [totalUsersResult, activeUsersResult, todayLoginsResult, todayScansResult, successRateResult] =
        await Promise.all([
          // 전체 사용자 수
          pool.request().query('SELECT COUNT(*) as count FROM Users'),

          // 활성 사용자 수 (최근 30일 로그인한 사용자)
          pool.request().query(`
            SELECT COUNT(DISTINCT userId) as count 
            FROM LoginLogs 
            WHERE loginAt >= DATEADD(DAY, -30, GETDATE()) 
            AND loginStatus = 'success'
          `),

          // 오늘 로그인 수
          pool.request().query(`
            SELECT COUNT(*) as count 
            FROM LoginLogs 
            WHERE CAST(loginAt AS DATE) = CAST(GETDATE() AS DATE)
          `),

          // 오늘 스캔 수
          pool.request().query(`
            SELECT COUNT(*) as count 
            FROM ScanLogs 
            WHERE CAST(scannedAt AS DATE) = CAST(GETDATE() AS DATE)
          `),

          // 오늘 스캔 성공률
          pool.request().query(`
            SELECT 
              COUNT(*) as totalScans,
              COUNT(CASE WHEN scanResult = 'success' THEN 1 END) as successScans
            FROM ScanLogs 
            WHERE CAST(scannedAt AS DATE) = CAST(GETDATE() AS DATE)
          `),
        ]);

      const totalUsers = totalUsersResult.recordset[0].count;
      const activeUsers = activeUsersResult.recordset[0].count;
      const todayLogins = todayLoginsResult.recordset[0].count;
      const todayScans = todayScansResult.recordset[0].count;

      const { totalScans, successScans } = successRateResult.recordset[0];
      const successRate = totalScans > 0 ? Math.round((successScans / totalScans) * 100 * 100) / 100 : 100;

      return {
        totalUsers,
        activeUsers,
        todayLogins,
        todayScans,
        successRate,
      };
    } catch (error) {
      this.logger.error(`대시보드 통계 조회 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 최근 활동 조회
   */
  async getRecentActivities(limit: number = 5) {
    try {
      const pool = this.databaseService.getPool();

      const [recentLoginsResult, recentScansResult] = await Promise.all([
        // 최근 로그인 (기존 LoginLogs 구조 활용)
        pool.request().input('limit', sql.Int, limit).query(`
          SELECT TOP (@limit)
            username,
            teamName,
            loginStatus,
            loginAt,
            ipAddress
          FROM LoginLogs 
          ORDER BY loginAt DESC
        `),

        // 최근 스캔 (기존 ScanLogs 구조 활용)
        pool.request().input('limit', sql.Int, limit).query(`
          SELECT TOP (@limit)
            username,
            scannedBarcode,
            scanResult,
            scannedAt
          FROM ScanLogs 
          ORDER BY scannedAt DESC
        `),
      ]);

      return {
        recentLogins: recentLoginsResult.recordset,
        recentScans: recentScansResult.recordset,
      };
    } catch (error) {
      this.logger.error(`최근 활동 조회 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 사용자 목록 조회 (기존 Users 테이블 구조 활용)
   */
  async getUsers(query: { search?: string; page: number; limit: number }) {
    try {
      const pool = this.databaseService.getPool();
      const offset = (query.page - 1) * query.limit;

      // 기존 scan-logs.service.ts의 동적 WHERE 패턴 활용
      let whereConditions = ['1=1'];
      const request = pool.request().input('limit', sql.Int, query.limit).input('offset', sql.Int, offset);

      if (query.search) {
        whereConditions.push('(username LIKE @search OR fullName LIKE @search)');
        request.input('search', sql.NVarChar(100), `%${query.search}%`);
      }

      const whereClause = whereConditions.join(' AND ');

      // 총 개수 조회
      const countResult = await request.query(`
        SELECT COUNT(*) as total 
        FROM Users 
        WHERE ${whereClause}
      `);

      // 페이지네이션된 사용자 목록 조회
      const usersResult = await request.query(`
        SELECT 
          userId,
          username,
          fullName,
          teamCode,
          teamName,
          userStatus,
          userType,
          lastLoginAt,
          loginCount,
          createdAt
        FROM Users 
        WHERE ${whereClause}
        ORDER BY createdAt DESC
        OFFSET @offset ROWS 
        FETCH NEXT @limit ROWS ONLY
      `);

      const total = countResult.recordset[0].total;
      const totalPages = Math.ceil(total / query.limit);

      return {
        users: usersResult.recordset,
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error(`사용자 목록 조회 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 로그인 로그 조회 (기존 LoginLogs 테이블 구조 활용)
   */
  async getLoginLogs(query: { page: number; limit: number }) {
    try {
      const pool = this.databaseService.getPool();
      const offset = (query.page - 1) * query.limit;

      const [countResult, logsResult] = await Promise.all([
        pool.request().query('SELECT COUNT(*) as total FROM LoginLogs'),

        pool.request().input('limit', sql.Int, query.limit).input('offset', sql.Int, offset).query(`
          SELECT 
            logId,
            username,
            fullName,
            teamName,
            loginStatus,
            failureReason,
            ipAddress,
            loginAt
          FROM LoginLogs 
          ORDER BY loginAt DESC
          OFFSET @offset ROWS 
          FETCH NEXT @limit ROWS ONLY
        `),
      ]);

      const total = countResult.recordset[0].total;
      const totalPages = Math.ceil(total / query.limit);

      return {
        logs: logsResult.recordset,
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error(`로그인 로그 조회 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 스캔 로그 조회 - 기존 ScanLogsService 활용
   */
  async getScanLogs(query: { page: number; limit: number }) {
    try {
      // 기존 ScanLogsService의 findScanLogs 메서드 재사용
      return await this.scanLogsService.findScanLogs({
        page: query.page,
        limit: query.limit,
      });
    } catch (error) {
      this.logger.error(`스캔 로그 조회 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 사용자 등록 (관리자 전용)
   */
  async createUser(createUserDto: CreateUserDto) {
    try {
      const pool = this.databaseService.getPool();

      // 1. 사용자명 중복 체크
      const existingUserResult = await pool
        .request()
        .input('username', sql.NVarChar(50), createUserDto.username)
        .query('SELECT COUNT(*) as count FROM Users WHERE username = @username');

      if (existingUserResult.recordset[0].count > 0) {
        throw new Error('이미 존재하는 사용자명입니다.');
      }

      // 2. 비밀번호 해시화 (기존 auth.service.ts 패턴 활용)
      const argon2 = require('argon2');
      const passwordHash = await argon2.hash(createUserDto.password);

      // 3. 사용자 생성
      const result = await pool
        .request()
        .input('username', sql.NVarChar(50), createUserDto.username)
        .input('passwordHash', sql.NVarChar(255), passwordHash)
        .input('fullName', sql.NVarChar(100), createUserDto.fullName)
        .input('email', sql.NVarChar(100), createUserDto.email || null)
        .input('phone', sql.NVarChar(20), createUserDto.phone || null)
        .input('teamCode', sql.NVarChar(50), createUserDto.teamCode || null)
        .input('teamName', sql.NVarChar(100), createUserDto.teamName || null)
        .input('employeeNo', sql.NVarChar(20), createUserDto.employeeNo || null)
        .input('position', sql.NVarChar(50), createUserDto.position || null)
        .input('userType', sql.NVarChar(20), createUserDto.userType || 'user').query(`
          INSERT INTO Users 
            (username, passwordHash, fullName, email, phone, teamCode, teamName, employeeNo, position, userType)
          OUTPUT INSERTED.userId, INSERTED.username, INSERTED.fullName, INSERTED.teamCode, INSERTED.teamName, 
                 INSERTED.userType, INSERTED.userStatus, INSERTED.createdAt
          VALUES 
            (@username, @passwordHash, @fullName, @email, @phone, @teamCode, @teamName, @employeeNo, @position, @userType)
        `);

      const newUser = result.recordset[0];

      this.logger.log(`사용자 등록 성공: ${createUserDto.username} by admin`);

      // 비밀번호 제외하고 반환
      return newUser;
    } catch (error) {
      this.logger.error(`사용자 등록 실패: ${error.message}`);
      throw error;
    }
  }
}
