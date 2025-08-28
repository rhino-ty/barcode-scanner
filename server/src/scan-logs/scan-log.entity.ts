/**
 * ScanLog 데이터의 구조를 정의하는 클래스입니다.
 */
export class ScanLog {
  logId: number;
  // 사용자 정보 (중복 저장으로 성능 최적화)
  userId?: number;
  username?: string;
  fullName?: string;
  teamName?: string;
  // 스캔 정보
  scannedBarcode: string;
  scanResult: string; // 'success', 'failed'
  errorMessage?: string;
  // 기술 정보
  ipAddress?: string;
  deviceInfo?: string;
  userAgent?: string;
  // 시간 정보
  scannedAt: Date;
}
