// admin/dto/create-user.dto.ts
import { IsString, IsNotEmpty, IsOptional, MaxLength, MinLength, IsEnum, IsEmail, Matches } from 'class-validator';

export enum UserType {
  USER = 'user',
  ADMIN = 'admin',
}

/**
 * 관리자용 사용자 생성 DTO
 */
export class CreateUserDto {
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

  @IsString({ message: '이름은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  @MaxLength(100, { message: '이름은 최대 100자까지 입력할 수 있습니다.' })
  fullName: string;

  @IsEmail({}, { message: '올바른 이메일 형식이 아닙니다.' })
  @IsOptional()
  @MaxLength(100, { message: '이메일은 최대 100자까지 입력할 수 있습니다.' })
  email?: string;

  @IsString({ message: '전화번호는 문자열이어야 합니다.' })
  @IsOptional()
  @MaxLength(20, { message: '전화번호는 최대 20자까지 입력할 수 있습니다.' })
  @Matches(/^[0-9-+\s()]+$/, { message: '올바른 전화번호 형식이 아닙니다.' })
  phone?: string;

  @IsString({ message: '팀 코드는 문자열이어야 합니다.' })
  @IsOptional()
  @MaxLength(50, { message: '팀 코드는 최대 50자까지 입력할 수 있습니다.' })
  teamCode?: string;

  @IsString({ message: '팀명은 문자열이어야 합니다.' })
  @IsOptional()
  @MaxLength(100, { message: '팀명은 최대 100자까지 입력할 수 있습니다.' })
  teamName?: string;

  @IsString({ message: '사번은 문자열이어야 합니다.' })
  @IsOptional()
  @MaxLength(20, { message: '사번은 최대 20자까지 입력할 수 있습니다.' })
  employeeNo?: string;

  @IsString({ message: '직급은 문자열이어야 합니다.' })
  @IsOptional()
  @MaxLength(50, { message: '직급은 최대 50자까지 입력할 수 있습니다.' })
  position?: string;

  @IsEnum(UserType, { message: '사용자 권한은 user 또는 admin이어야 합니다.' })
  @IsOptional()
  userType?: UserType = UserType.USER;
}