import type { UsersQueryParams, LogsQueryParams } from '@/api/admin';

/**
 * React Query 키 팩토리 for Admin API
 * 타입 안정성 보장 및 중앙화된 키 관리
 */
export const adminQueryKeys = {
  // 기본 루트
  all: ['admin'] as const,

  // 대시보드
  stats: () => [...adminQueryKeys.all, 'stats'] as const,
  activities: (limit: number = 5) => [...adminQueryKeys.all, 'activities', limit] as const,

  // 사용자 관리
  users: (params: UsersQueryParams = {}) => [...adminQueryKeys.all, 'users', params] as const,

  // 로그 관리
  loginLogs: (params: LogsQueryParams = {}) => [...adminQueryKeys.all, 'login-logs', params] as const,
  scanLogs: (params: LogsQueryParams = {}) => [...adminQueryKeys.all, 'scan-logs', params] as const,
} as const;
