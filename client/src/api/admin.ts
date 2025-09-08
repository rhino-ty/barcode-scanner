import { apiRequest } from '@/api/fetch-wrapper';

// ===== 기본 타입 정의 =====
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  todayLogins: number;
  todayScans: number;
  successRate: number;
}

export interface RecentLoginActivity {
  username: string;
  teamName?: string;
  loginStatus: 'success' | 'failed' | 'locked';
  loginAt: string;
  ipAddress?: string;
}

export interface RecentScanActivity {
  username: string;
  scannedBarcode: string;
  scanResult: 'success' | 'failed';
  scannedAt: string;
}

export interface RecentActivity {
  recentLogins: RecentLoginActivity[];
  recentScans: RecentScanActivity[];
}

export interface AdminUser {
  userId: number;
  username: string;
  fullName: string;
  teamCode?: string;
  teamName?: string;
  userStatus: 'active' | 'inactive' | 'locked' | 'deleted';
  userType: 'user' | 'admin';
  lastLoginAt?: string;
  loginCount: number;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UsersResponse extends PaginatedResponse<AdminUser> {
  users: AdminUser[];
}

export interface LoginLog {
  logId: number;
  username?: string;
  fullName?: string;
  teamName?: string;
  loginStatus: 'success' | 'failed' | 'locked';
  failureReason?: string;
  ipAddress?: string;
  loginAt: string;
}

export interface LoginLogsResponse extends PaginatedResponse<LoginLog> {
  logs: LoginLog[];
}

export interface ScanLog {
  logId: number;
  username?: string;
  fullName?: string;
  teamName?: string;
  scannedBarcode: string;
  scanResult: 'success' | 'failed';
  errorMessage?: string;
  ipAddress?: string;
  scannedAt: string;
}

export interface ScanLogsResponse extends PaginatedResponse<ScanLog> {
  logs: ScanLog[];
}

// ===== 요청 타입 정의 =====
export interface CreateUserRequest {
  username: string;
  password: string;
  fullName: string;
  email?: string;
  phone?: string;
  teamCode?: string;
  teamName?: string;
  employeeNo?: string;
  position?: string;
  userType?: 'user' | 'admin';
}

export interface UsersQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface LogsQueryParams {
  page?: number;
  limit?: number;
}

// ===== API 함수들 (타입 안전성 강화) =====

/**
 * 대시보드 통계 조회
 */
export const getAdminStatsApi = async (token: string): Promise<AdminStats> => {
  console.log('대시보드 통계 조회 API 호출');

  return apiRequest<AdminStats>('/admin/dashboard/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * 최근 활동 조회
 */
export const getRecentActivitiesApi = async (token: string, limit: number = 5): Promise<RecentActivity> => {
  console.log(`최근 활동 조회 API 호출 (limit: ${limit})`);

  return apiRequest<RecentActivity>(`/admin/recent-activities?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * 사용자 목록 조회
 */
export const getUsersApi = async (token: string, params: UsersQueryParams = {}): Promise<UsersResponse> => {
  const { search = '', page = 1, limit = 20 } = params;

  console.log(`사용자 목록 조회 API 호출 (search: ${search}, page: ${page})`);

  const searchParams = new URLSearchParams();
  if (search) searchParams.append('search', search);
  searchParams.append('page', page.toString());
  searchParams.append('limit', limit.toString());

  return apiRequest<UsersResponse>(`/admin/users?${searchParams.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * 사용자 등록
 */
export const createUserApi = async (token: string, userData: CreateUserRequest): Promise<AdminUser> => {
  console.log(`사용자 등록 API 호출: ${userData.username}`);
  // 빈 문자열 정제
  const cleanData = Object.fromEntries(
    Object.entries(userData).filter(([, value]) => value !== ''),
  ) as CreateUserRequest;

  return apiRequest<AdminUser>('/admin/users', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(cleanData),
  });
};

/**
 * 로그인 로그 조회
 */
export const getLoginLogsApi = async (token: string, params: LogsQueryParams = {}): Promise<LoginLogsResponse> => {
  const { page = 1, limit = 20 } = params;

  console.log(`로그인 로그 조회 API 호출 (page: ${page})`);

  const searchParams = new URLSearchParams();
  searchParams.append('page', page.toString());
  searchParams.append('limit', limit.toString());

  return apiRequest<LoginLogsResponse>(`/admin/logs/login?${searchParams.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * 스캔 로그 조회
 */
export const getScanLogsApi = async (token: string, params: LogsQueryParams = {}): Promise<ScanLogsResponse> => {
  const { page = 1, limit = 20 } = params;

  console.log(`스캔 로그 조회 API 호출 (page: ${page})`);

  const searchParams = new URLSearchParams();
  searchParams.append('page', page.toString());
  searchParams.append('limit', limit.toString());

  return apiRequest<ScanLogsResponse>(`/admin/logs/scan?${searchParams.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ===== 타입 가드 함수들 =====

/**
 * AdminUser 타입 가드
 */
export const isAdminUser = (user: any): user is AdminUser => {
  return (
    typeof user === 'object' &&
    user !== null &&
    typeof user.userId === 'number' &&
    typeof user.username === 'string' &&
    typeof user.fullName === 'string' &&
    ['user', 'admin'].includes(user.userType) &&
    ['active', 'inactive', 'locked', 'deleted'].includes(user.userStatus)
  );
};

/**
 * 페이지네이션 응답 타입 가드
 */
export const isPaginatedResponse = <T>(response: any): response is PaginatedResponse<T> => {
  return (
    typeof response === 'object' &&
    response !== null &&
    typeof response.total === 'number' &&
    typeof response.page === 'number' &&
    typeof response.limit === 'number' &&
    typeof response.totalPages === 'number' &&
    Array.isArray(response.data)
  );
};

// ===== 상수 정의 =====
export const USER_STATUS = {
  ACTIVE: 'active' as const,
  INACTIVE: 'inactive' as const,
  LOCKED: 'locked' as const,
  DELETED: 'deleted' as const,
} as const;

export const USER_TYPE = {
  USER: 'user' as const,
  ADMIN: 'admin' as const,
} as const;

export const LOGIN_STATUS = {
  SUCCESS: 'success' as const,
  FAILED: 'failed' as const,
  LOCKED: 'locked' as const,
} as const;

export const SCAN_RESULT = {
  SUCCESS: 'success' as const,
  FAILED: 'failed' as const,
} as const;
