
import { Injectable } from '@nestjs/common';
import * as sql from 'mssql';
import { DatabaseService } from '../database/database.service';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * 사용자 이름으로 사용자를 찾습니다.
   */
  async findByUsername(username: string): Promise<User | undefined> {
    const pool = this.databaseService.getPool();
    const result = await pool
      .request()
      .input('username', sql.NVarChar(50), username)
      .query('SELECT * FROM Users WHERE username = @username');

    return result.recordset[0] as User;
  }

  /**
   * 로그인 성공 시 사용자 정보를 업데이트합니다.
   */
  async handleLoginSuccess(userId: number): Promise<void> {
    const pool = this.databaseService.getPool();
    await pool
      .request()
      .input('userId', sql.Int, userId)
      .query`UPDATE Users 
              SET lastLoginAt = GETDATE(), 
                  failedLoginCount = 0, 
                  accountLockedUntil = NULL, 
                  loginCount = loginCount + 1 
              WHERE userId = @userId`;
  }

  /**
   * 로그인 실패 시 사용자 정보를 업데이트하고, 필요한 경우 계정을 잠급니다.
   */
  async handleLoginFailure(user: User): Promise<Date | null> {
    const pool = this.databaseService.getPool();
    const newFailureCount = user.failedLoginCount + 1;
    const LOCK_THRESHOLD = 5; // 5회 실패 시 잠금

    if (newFailureCount >= LOCK_THRESHOLD) {
      const lockDurationMinutes = 30; // 30분 동안 잠금
      const accountLockedUntil = new Date();
      accountLockedUntil.setMinutes(
        accountLockedUntil.getMinutes() + lockDurationMinutes,
      );

      await pool
        .request()
        .input('userId', sql.Int, user.userId)
        .input('newFailureCount', sql.Int, newFailureCount)
        .input('accountLockedUntil', sql.DateTime2, accountLockedUntil)
        .query`UPDATE Users 
                SET failedLoginCount = @newFailureCount, 
                    userStatus = 'locked', 
                    accountLockedUntil = @accountLockedUntil
                WHERE userId = @userId`;

      return accountLockedUntil;
    } else {
      await pool
        .request()
        .input('userId', sql.Int, user.userId)
        .input('newFailureCount', sql.Int, newFailureCount)
        .query`UPDATE Users 
                SET failedLoginCount = @newFailureCount 
                WHERE userId = @userId`;

      return null;
    }
  }
}
