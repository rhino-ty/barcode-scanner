import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as sql from 'mssql';
import { DatabaseService } from '../database/database.service';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { EnvVars } from '../config/env.validation';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvVars, true>,
    private readonly databaseService: DatabaseService,
  ) {}

  /**
   * 사용자 인증 (LocalStrategy에서 호출)
   */
  async validateUser(
    username: string,
    pass: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.userService.findByUsername(username);

    if (!user) {
      // 존재하지 않는 사용자도 로그 남김
      await this.createLoginLog(
        { userId: null, username, fullName: null, teamCode: null, teamName: null } as any,
        'failed',
        ipAddress,
        userAgent,
        { failureReason: 'User not found' },
      );
      throw new UnauthorizedException('잘못된 인증 정보입니다.');
    }

    // 계정 잠금 상태 확인
    if (user.userStatus === 'locked' && user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      await this.createLoginLog(user, 'locked', ipAddress, userAgent, {
        failureReason: 'Account is locked',
      });
      const minutesLeft = Math.ceil((new Date(user.accountLockedUntil).getTime() - new Date().getTime()) / 60000);
      throw new UnauthorizedException(`계정이 잠겨있습니다. ${minutesLeft}분 후에 다시 시도해주세요.`);
    }

    // 비밀번호 검증
    const isPasswordMatching = await argon2.verify(user.passwordHash, pass);

    if (!isPasswordMatching) {
      const lockedUntil = await this.userService.handleLoginFailure(user);
      const failureReason = lockedUntil ? 'Login failed, account has been locked' : 'Incorrect password';
      await this.createLoginLog(user, 'failed', ipAddress, userAgent, { failureReason });
      throw new UnauthorizedException('잘못된 인증 정보입니다.');
    }

    // 로그인 성공 처리
    await this.userService.handleLoginSuccess(user.userId);
    await this.createLoginLog(user, 'success', ipAddress, userAgent);

    this.logger.log(`성공적인 로그인: ${user.username} (${ipAddress})`);

    // 비밀번호 해시 제거 후 반환
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user;
    return result;
  }

  /**
   * JWT 토큰 생성 (로그인 성공 시)
   */
  async login(user: Omit<User, 'passwordHash'>) {
    const payload = {
      username: user.username,
      sub: user.userId,
      userType: user.userType,
    };

    const refreshPayload = {
      ...payload,
      tokenType: 'refresh' as const,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET', { infer: true }),
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN', { infer: true }),
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET', { infer: true }),
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN', { infer: true }),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        userId: user.userId,
        username: user.username,
        fullName: user.fullName,
        teamCode: user.teamCode,
        teamName: user.teamName,
        userType: user.userType,
        userStatus: user.userStatus,
      },
    };
  }

  // userAgent 파싱 헬퍼 메서드
  private parseDeviceInfo(userAgent?: string): string | null {
    if (!userAgent) return null;

    const ua = userAgent.toLowerCase();

    // OS 감지
    let os = 'Unknown';
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac os')) os = 'macOS';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
    else if (ua.includes('linux')) os = 'Linux';

    // 브라우저 감지
    let browser = 'Unknown';
    if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
    else if (ua.includes('edg')) browser = 'Edge';

    // 디바이스 타입
    let deviceType = 'Desktop';
    if (ua.includes('mobile')) deviceType = 'Mobile';
    else if (ua.includes('tablet') || ua.includes('ipad')) deviceType = 'Tablet';

    return `${os}/${browser} (${deviceType})`;
    // 결과 예: "macOS/Chrome (Desktop)", "Android/Chrome (Mobile)"
  }

  /**
   * 로그인 로그 생성
   */
  private async createLoginLog(
    user: Partial<User>,
    status: 'success' | 'failed' | 'locked',
    ipAddress?: string,
    userAgent?: string,
    options?: { failureReason?: string },
  ): Promise<void> {
    try {
      const pool = this.databaseService.getPool();
      await pool
        .request()
        .input('userId', sql.Int, user.userId || null)
        .input('username', sql.NVarChar(50), user.username || null)
        .input('fullName', sql.NVarChar(100), user.fullName || null)
        .input('teamCode', sql.NVarChar(50), user.teamCode || null)
        .input('teamName', sql.NVarChar(100), user.teamName || null)
        .input('loginStatus', sql.NVarChar(20), status)
        .input('failureReason', sql.NVarChar(100), options?.failureReason || null)
        .input('ipAddress', sql.NVarChar(45), ipAddress || null)
        .input('userAgent', sql.NVarChar(500), userAgent || null) // 🔧 추가
        .input('deviceInfo', sql.NVarChar(100), this.parseDeviceInfo(userAgent) || null).query`
          INSERT INTO LoginLogs 
            (userId, username, fullName, teamCode, teamName, loginStatus, failureReason, ipAddress, userAgent, deviceInfo) 
          VALUES 
            (@userId, @username, @fullName, @teamCode, @teamName, @loginStatus, @failureReason, @ipAddress, @userAgent, @deviceInfo)
        `;
    } catch (error) {
      this.logger.error(`로그인 로그 생성 실패: ${error.message}`);
      // 로그 생성 실패가 인증 프로세스를 방해하지 않도록 에러를 던지지 않음
    }
  }
}
