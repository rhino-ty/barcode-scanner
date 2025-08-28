import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Logger,
  ParseIntPipe,
} from '@nestjs/common';
import { ScanLogsService } from './scan-logs.service';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { CreateScanLogDto, GetScanLogsQueryDto, GetScanStatsQueryDto } from './dto/scan-log.dto';

@Controller('scan-logs')
@UseGuards(AccessTokenGuard) // 모든 엔드포인트에 인증 필요
export class ScanLogsController {
  private readonly logger = new Logger(ScanLogsController.name);

  constructor(private readonly scanLogsService: ScanLogsService) {}

  /**
   * 바코드 스캔 로그 생성
   * POST /api/scan-logs
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createScanLog(@Request() req, @Body() createScanLogDto: CreateScanLogDto) {
    const ipAddress = this.extractIpAddress(req);
    const userAgent = req.headers['user-agent'];

    this.logger.log(`스캔 로그 생성 요청: ${req.user.username} - ${createScanLogDto.scannedBarcode}`);

    const scanLog = await this.scanLogsService.createScanLog(createScanLogDto, req.user, ipAddress, userAgent);

    return {
      success: true,
      message: '스캔 로그가 성공적으로 생성되었습니다.',
      data: scanLog,
    };
  }

  /**
   * 스캔 로그 목록 조회 (페이지네이션, 필터링)
   * GET /api/scan-logs
   */
  @Get()
  async getScanLogs(@Query() query: GetScanLogsQueryDto) {
    this.logger.log(`스캔 로그 목록 조회: 페이지 ${query.page}, 크기 ${query.limit}`);

    const result = await this.scanLogsService.findScanLogs(query);

    return {
      success: true,
      message: '스캔 로그 목록 조회가 완료되었습니다.',
      data: result,
    };
  }

  /**
   * 스캔 로그 상세 조회
   * GET /api/scan-logs/:logId
   */
  @Get(':logId')
  async getScanLog(@Param('logId', ParseIntPipe) logId: number) {
    this.logger.log(`스캔 로그 상세 조회: ${logId}`);

    const scanLog = await this.scanLogsService.findScanLogById(logId);

    return {
      success: true,
      message: '스캔 로그 상세 조회가 완료되었습니다.',
      data: scanLog,
    };
  }

  /**
   * 스캔 통계 조회
   * GET /api/scan-logs/stats
   */
  @Get('stats/summary')
  async getScanStats(@Query() query: GetScanStatsQueryDto) {
    this.logger.log(`스캔 통계 조회: 기간 ${query.period}, 그룹 ${query.groupBy}`);

    const stats = await this.scanLogsService.getScanStats(query);

    return {
      success: true,
      message: '스캔 통계 조회가 완료되었습니다.',
      data: stats,
    };
  }

  /**
   * 내 스캔 이력 조회
   * GET /api/scan-logs/my-recent
   */
  @Get('my/recent')
  async getMyRecentScans(@Request() req, @Query('limit', ParseIntPipe) limit: number = 10) {
    this.logger.log(`내 스캔 이력 조회: ${req.user.username} (${limit}개)`);

    const recentScans = await this.scanLogsService.getRecentScansByUser(req.user.userId, limit);

    return {
      success: true,
      message: '최근 스캔 이력 조회가 완료되었습니다.',
      data: recentScans,
    };
  }

  /**
   * 특정 바코드 스캔 이력 조회
   * GET /api/scan-logs/barcode/:barcode
   */
  @Get('barcode/:barcode')
  async getScansByBarcode(@Param('barcode') barcode: string, @Query('limit', ParseIntPipe) limit: number = 50) {
    this.logger.log(`바코드별 스캔 이력 조회: ${barcode} (${limit}개)`);

    const scans = await this.scanLogsService.getScansByBarcode(barcode, limit);

    return {
      success: true,
      message: '바코드별 스캔 이력 조회가 완료되었습니다.',
      data: {
        barcode,
        scans,
        total: scans.length,
      },
    };
  }

  /**
   * 오늘의 스캔 현황 (대시보드용)
   * GET /api/scan-logs/today/dashboard
   */
  @Get('today/dashboard')
  async getTodayDashboard(@Request() req) {
    this.logger.log(`오늘의 스캔 현황 조회: ${req.user.username}`);

    // 오늘 전체 통계
    const todayStats = await this.scanLogsService.getScanStats({
      period: 'today',
      groupBy: 'user',
    });

    // 내 오늘 스캔 이력
    const myRecentScans = await this.scanLogsService.getRecentScansByUser(req.user.userId, 5);

    return {
      success: true,
      message: '오늘의 스캔 현황 조회가 완료되었습니다.',
      data: {
        todayStats: todayStats.summary,
        myRecentScans,
        teamRanking: todayStats.details.slice(0, 10), // 상위 10명
      },
    };
  }

  /**
   * IP 주소 추출 헬퍼 함수
   */
  private extractIpAddress(req: any): string {
    return (
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      'unknown'
    );
  }
}
