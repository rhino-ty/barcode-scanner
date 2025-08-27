import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import { EnvVars } from '../../config/env.validation';
import { Request } from 'express';

export interface RefreshTokenPayload {
  sub: number; // userId
  username: string;
  userType: string;
  tokenType: 'refresh';
  iat?: number;
  exp?: number;
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly configService: ConfigService<EnvVars, true>,
    private readonly userService: UserService,
  ) {
    super({
      // 여러 방식으로 refresh token 추출 지원
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromBodyField('refreshToken'), // Body에서
        ExtractJwt.fromBodyField('refresh_token'), // Body에서 (snake_case)
        ExtractJwt.fromAuthHeaderAsBearerToken(), // Authorization 헤더에서
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_REFRESH_TOKEN_SECRET', { infer: true }),
      passReqToCallback: true,
    });
  }

  /**
   * Refresh Token 검증 및 사용자 상태 확인
   */
  async validate(req: Request, payload: RefreshTokenPayload) {
    // refresh token인지 확인
    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('잘못된 토큰 타입입니다.');
    }

    // 사용자 존재 및 상태 확인
    const user = await this.userService.findByUsername(payload.username);

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    // 계정 상태 검증
    if (user.userStatus === 'inactive' || user.userStatus === 'deleted') {
      throw new UnauthorizedException('비활성화된 계정입니다.');
    }

    if (user.userStatus === 'locked' && user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      throw new UnauthorizedException('잠긴 계정입니다.');
    }

    // 원본 토큰과 함께 사용자 정보 반환
    const refreshToken =
      req.body?.refreshToken || req.body?.refresh_token || req.get('Authorization')?.replace('Bearer ', '');

    const { passwordHash, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      refreshToken, // 토큰 갱신시 필요할 수 있음
    };
  }
}
