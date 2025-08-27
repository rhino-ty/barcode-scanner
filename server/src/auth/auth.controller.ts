import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * 로그인 API
   * POST /api/auth/login
   */
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req, @Body() loginDto: LoginDto) {
    this.logger.log(`로그인 시도: ${loginDto.username}`);
    // 서비스에서 받은 토큰과 사용자 정보를 그대로 반환
    return this.authService.login(req.user);
  }

  /**
   * 토큰 갱신 API
   * POST /api/auth/refresh
   */
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Request() req) {
    this.logger.log(`토큰 갱신 요청: ${req.user.username}`);
    // 서비스에서 받은 새로운 토큰 정보를 그대로 반환
    return this.authService.login(req.user);
  }

  /**
   * 사용자 프로필 조회 API
   * GET /api/auth/profile
   */
  @UseGuards(AccessTokenGuard)
  @Get('profile')
  getProfile(@Request() req) {
    // 가드를 통과한 사용자 정보를 그대로 반환
    return req.user;
  }

  /**
   * 로그아웃 API
   * POST /api/auth/logout
   */
  @UseGuards(AccessTokenGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Request() req) {
    this.logger.log(`로그아웃: ${req.user.username}`);
    // 인터셉터가 메시지를 포함한 표준 응답으로 변환해 줄 것임
    return { message: '성공적으로 로그아웃되었습니다.' };
  }

  /**
   * 토큰 검증 API
   * GET /api/auth/verify
   */
  @UseGuards(AccessTokenGuard)
  @Get('verify')
  verifyToken(@Request() req) {
    // 가드를 통과했다는 것 자체가 토큰이 유효하다는 의미
    return { tokenValid: true, user: req.user };
  }
}