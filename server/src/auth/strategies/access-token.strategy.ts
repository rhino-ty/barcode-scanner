import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import { EnvVars } from '../../config/env.validation';

export interface JwtPayload {
  sub: number; // userId
  username: string;
  userType: string;
  iat?: number; // issued at
  exp?: number; // expires at
}

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService<EnvVars, true>,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET', { infer: true }),
    });
  }

  /**
   * JWT 토큰 검증 후 사용자 상태 확인
   */
  async validate(payload: JwtPayload) {
    // 실제 사용자 존재 여부 및 상태 확인
    const user = await this.userService.findByUsername(payload.username);

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    // 계정 상태 검증
    if (user.userStatus === 'inactive') {
      throw new UnauthorizedException('비활성화된 계정입니다.');
    }

    if (user.userStatus === 'deleted') {
      throw new UnauthorizedException('삭제된 계정입니다.');
    }

    if (user.userStatus === 'locked' && user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      const minutesLeft = Math.ceil((new Date(user.accountLockedUntil).getTime() - new Date().getTime()) / 60000);
      throw new UnauthorizedException(`계정이 잠겨있습니다. ${minutesLeft}분 후에 다시 시도해주세요.`);
    }

    // 비밀번호 해시 제거 후 반환
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      userId: user.userId,
      username: user.username,
      userType: user.userType,
      fullName: user.fullName,
      teamCode: user.teamCode,
      teamName: user.teamName,
      userStatus: user.userStatus,
    };
  }
}
