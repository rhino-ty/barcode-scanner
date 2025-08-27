/**
 * User 데이터의 구조를 정의하는 클래스입니다.
 * TypeORM 데코레이터는 사용하지 않으므로 순수 TypeScript 클래스로 사용됩니다.
 */
export class User {
  userId: number;
  username: string;
  passwordHash: string;
  fullName: string;
  email?: string;
  phone?: string;
  teamCode?: string;
  teamName?: string;
  employeeNo?: string;
  position?: string;
  userStatus: string;
  userType: string;
  lastLoginAt?: Date;
  loginCount: number;
  failedLoginCount: number;
  accountLockedUntil?: Date;
  passwordChangedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
