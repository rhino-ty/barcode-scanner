import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Logger,
  ParseIntPipe,
  ConflictException,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('admin')
@UseGuards(AccessTokenGuard, AdminGuard)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminService: AdminService) {}

  /**
   * 대시보드 통계 조회
   * GET /api/admin/dashboard/stats
   */
  @Get('dashboard/stats')
  @HttpCode(HttpStatus.OK)
  async getDashboardStats(@Request() req) {
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
    this.logger.log(`사용자 목록 조회: ${req.user.username} (search: ${search}, page: ${page})`);

    const result = await this.adminService.getUsers({ search, page, limit });

    return {
      success: true,
      message: '사용자 목록 조회가 완료되었습니다.',
      data: result,
    };
  }

  /**
   * 사용자 등록
   * POST /api/admin/users
   */
  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Request() req, @Body() createUserDto: CreateUserDto) {
    this.logger.log(`사용자 등록 시도: ${createUserDto.username} by ${req.user.username}`);

    try {
      const newUser = await this.adminService.createUser(createUserDto);
      return {
        success: true,
        message: '사용자 등록이 완료되었습니다.',
        data: newUser,
      };
    } catch (error) {
      if (error.message.includes('이미 존재하는 사용자명입니다.')) {
        throw new ConflictException(error.message);
      }
      this.logger.error(`사용자 등록 실패: ${error.message}`, error.stack);
      throw error;
    }
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
