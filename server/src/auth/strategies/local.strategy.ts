import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'username',
      // Request 객체를 strategy에 전달 (IP 추출용)
      passReqToCallback: true,
    });
  }

  /**
   * 로컬 인증 전략 - IP 주소 추출 지원
   * @param req - Express Request 객체
   * @param username - 사용자명
   * @param password - 비밀번호
   */
  async validate(req: any, username: string, password: string): Promise<any> {
    // IP 주소 추출 (프록시 환경 고려)
    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      'unknown';

    const user = await this.authService.validateUser(username, password, ipAddress);

    if (!user) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 일치하지 않습니다.');
    }

    return user;
  }
}
