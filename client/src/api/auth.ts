import { queryOptions } from '@tanstack/react-query';
import { apiRequest } from '@/api/fetch-wrapper.ts';

// ===== 타입 정의 =====
export interface User {
  userId: number;
  username: string;
  fullName: string;
  teamCode?: string;
  teamName?: string;
  userType: 'admin' | 'user';
  userStatus: 'active' | 'inactive' | 'locked';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// ===== API 함수들 =====

/**
 * 로그인 API
 */
export const loginApi = async (credentials: LoginRequest): Promise<LoginResponse> => {
  console.log('로그인 API 호출:', credentials.username);

  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
};

/**
 * 사용자 프로필 조회 API
 */
export const getUserProfileApi = async (token: string): Promise<User> => {
  console.log('사용자 프로필 조회');

  return apiRequest('/auth/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * 토큰 갱신 API
 */
export const refreshTokenApi = async (refreshToken: string): Promise<LoginResponse> => {
  console.log('토큰 갱신 API 호출');

  return apiRequest('/auth/refresh', {
    method: 'POST',
    headers: { Authorization: `Bearer ${refreshToken}` },
  });
};

// ===== Query Options(v5): queryOptions를 사용하면 타입 안전성과 재사용성이 향상됨

/**
 * 사용자 프로필 쿼리 옵션입니다. useQuery, prefetchQuery, setQueryData 등에서 동일한 설정 재사용 가능합니다.
 */
export const userProfileQueryOptions = (accessToken: string | null) =>
  queryOptions({
    queryKey: ['auth', 'user-profile'] as const, // as const로 타입 추론 향상
    queryFn: () => getUserProfileApi(accessToken!),
    enabled: !!accessToken, // 토큰이 있을 때만 쿼리 실행
    staleTime: 10 * 60 * 1000, // 10분간 신선하다고 간주
    gcTime: 30 * 60 * 1000, // 30분간 캐시 보관
    retry: (failureCount, error: any) => {
      // 401 에러는 재시도하지 않음 (토큰 만료)
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
  });
