import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Logger,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';

@Controller('admin')
@UseGuards(AccessTokenGuard)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminService: AdminService) {}

  /**
   * 관리자 권한 체크
   */
  private checkAdminPermission(user: any) {
    if (user.userType !== 'admin') {
      throw new ForbiddenException('관리자 권한이 필요합니다.');
    }
  }

  /**
   * 대시보드 통계 조회
   * GET /api/admin/dashboard/stats
   */
  @Get('dashboard/stats')
  @HttpCode(HttpStatus.OK)
  async getDashboardStats(@Request() req) {
    this.checkAdminPermission(req.user);

    this.logger.log(`대시보드 통계 조회: ${req.user.username}`);

    const stats = await this.adminService.getDashboardStats();

    return {
      success: true,
      message: '대시보드 통계 조회가 완료되었습니다.',
      data: stats,
    };
  }

  /**
   * 최근 활동 조회
   * GET /api/admin/recent-activities?limit=5
   */
  @Get('recent-activities')
  @HttpCode(HttpStatus.OK)
  async getRecentActivities(@Request() req, @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 5) {
    this.checkAdminPermission(req.user);

    this.logger.log(`최근 활동 조회: ${req.user.username} (limit: ${limit})`);

    const activities = await this.adminService.getRecentActivities(limit);

    return {
      success: true,
      message: '최근 활동 조회가 완료되었습니다.',
      data: activities,
    };
  }

  /**
   * 사용자 목록 조회
   * GET /api/admin/users?search=검색어&page=1&limit=20
   */
  @Get('users')
  @HttpCode(HttpStatus.OK)
  async getUsers(
    @Request() req,
    @Query('search') search?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    this.checkAdminPermission(req.user);

    this.logger.log(`사용자 목록 조회: ${req.user.username} (search: ${search}, page: ${page})`);

    const result = await this.adminService.getUsers({ search, page, limit });

    return {
      success: true,
      message: '사용자 목록 조회가 완료되었습니다.',
      data: result,
    };
  }

  /**
   * 로그인 로그 조회
   * GET /api/admin/logs/login?page=1&limit=20
   */
  @Get('logs/login')
  @HttpCode(HttpStatus.OK)
  async getLoginLogs(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    this.checkAdminPermission(req.user);

    this.logger.log(`로그인 로그 조회: ${req.user.username} (page: ${page})`);

    const result = await this.adminService.getLoginLogs({ page, limit });

    return {
      success: true,
      message: '로그인 로그 조회가 완료되었습니다.',
      data: result,
    };
  }

  /**
   * 스캔 로그 조회 - 기존 ScanLogsService 재사용
   * GET /api/admin/logs/scan?page=1&limit=20
   */
  @Get('logs/scan')
  @HttpCode(HttpStatus.OK)
  async getScanLogs(
    @Request() req,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
  ) {
    this.checkAdminPermission(req.user);

    this.logger.log(`스캔 로그 조회: ${req.user.username} (page: ${page})`);

    // 기존 ScanLogsService의 findScanLogs 메서드 활용
    const result = await this.adminService.getScanLogs({ page, limit });

    return {
      success: true,
      message: '스캔 로그 조회가 완료되었습니다.',
      data: result,
    };
  }
}
