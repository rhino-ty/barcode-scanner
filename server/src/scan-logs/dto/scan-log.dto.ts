import { IsString, IsNotEmpty, IsOptional, MaxLength, IsEnum, IsInt, Min, Max, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export enum ScanResult {
  SUCCESS = 'success',
  FAILED = 'failed',
}

/**
 * 바코드 스캔 생성 DTO
 */
export class CreateScanLogDto {
  @IsString({ message: '스캔된 바코드는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '스캔된 바코드를 입력해주세요.' })
  @MaxLength(200, { message: '바코드는 최대 200자까지 입력할 수 있습니다.' })
  scannedBarcode: string;

  @IsEnum(ScanResult, { message: '스캔 결과는 success 또는 failed여야 합니다.' })
  @IsOptional()
  scanResult?: ScanResult = ScanResult.SUCCESS;

  @IsString({ message: '에러 메시지는 문자열이어야 합니다.' })
  @IsOptional()
  @MaxLength(200, { message: '에러 메시지는 최대 200자까지 입력할 수 있습니다.' })
  errorMessage?: string;

  @IsString({ message: '기기 정보는 문자열이어야 합니다.' })
  @IsOptional()
  @MaxLength(100, { message: '기기 정보는 최대 100자까지 입력할 수 있습니다.' })
  deviceInfo?: string;
}

/**
 * 스캔 로그 조회 쿼리 DTO
 */
export class GetScanLogsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '페이지는 정수여야 합니다.' })
  @Min(1, { message: '페이지는 1 이상이어야 합니다.' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '페이지 크기는 정수여야 합니다.' })
  @Min(1, { message: '페이지 크기는 1 이상이어야 합니다.' })
  @Max(100, { message: '페이지 크기는 100 이하여야 합니다.' })
  limit?: number = 20;

  @IsOptional()
  @IsString({ message: '사용자명은 문자열이어야 합니다.' })
  @MaxLength(50, { message: '사용자명은 최대 50자까지 입력할 수 있습니다.' })
  username?: string;

  @IsOptional()
  @IsString({ message: '팀명은 문자열이어야 합니다.' })
  @MaxLength(100, { message: '팀명은 최대 100자까지 입력할 수 있습니다.' })
  teamName?: string;

  @IsOptional()
  @IsEnum(ScanResult, { message: '스캔 결과는 success 또는 failed여야 합니다.' })
  scanResult?: ScanResult;

  @IsOptional()
  @IsString({ message: '날짜는 문자열이어야 합니다.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '시작 날짜는 YYYY-MM-DD 형식이어야 합니다.' })
  startDate?: string;

  @IsOptional()
  @IsString({ message: '날짜는 문자열이어야 합니다.' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: '종료 날짜는 YYYY-MM-DD 형식이어야 합니다.' })
  endDate?: string;

  @IsOptional()
  @IsString({ message: '바코드는 문자열이어야 합니다.' })
  @MaxLength(200, { message: '바코드는 최대 200자까지 입력할 수 있습니다.' })
  barcode?: string;
}

/**
 * 스캔 통계 조회 쿼리 DTO
 */
export class GetScanStatsQueryDto {
  @IsOptional()
  @IsString({ message: '기간은 문자열이어야 합니다.' })
  @IsEnum(['today', 'week', 'month', 'year'], {
    message: '기간은 today, week, month, year 중 하나여야 합니다.',
  })
  period?: 'today' | 'week' | 'month' | 'year' = 'today';

  @IsOptional()
  @IsString({ message: '그룹화 기준은 문자열이어야 합니다.' })
  @IsEnum(['user', 'team', 'hour', 'day'], {
    message: '그룹화는 user, team, hour, day 중 하나여야 합니다.',
  })
  groupBy?: 'user' | 'team' | 'hour' | 'day' = 'user';
}
