/**
 * LoginLog 데이터의 구조를 정의하는 클래스입니다.
 * TypeORM 데코레이터는 사용하지 않으므로 순수 TypeScript 클래스로 사용됩니다.
 */
export class LoginLog {
  logId: number;
  userId?: number;
  username?: string;
  fullName?: string;
  teamCode?: string;
  teamName?: string;
  loginStatus: string; // success, failed, locked
  failureReason?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  loginAt: Date;
  logoutAt?: Date;
}
