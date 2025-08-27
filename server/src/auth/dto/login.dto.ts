import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class LoginDto {
  @IsString({ message: '사용자명은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '사용자명을 입력해주세요.' })
  @MinLength(3, { message: '사용자명은 최소 3자 이상이어야 합니다.' })
  @MaxLength(50, { message: '사용자명은 최대 50자까지 입력할 수 있습니다.' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: '사용자명은 영문, 숫자, 언더스코어(_)만 사용할 수 있습니다.',
  })
  username: string;

  @IsString({ message: '비밀번호는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
  @MaxLength(128, { message: '비밀번호는 최대 128자까지 입력할 수 있습니다.' })
  password: string;
}

/**
 * 토큰 갱신용 DTO
 */
export class RefreshTokenDto {
  @IsString({ message: 'Refresh Token은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: 'Refresh Token을 입력해주세요.' })
  refreshToken: string;
}
