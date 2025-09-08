import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useAuth, getAccessToken } from '@/hooks/auth/useAuth';
import { adminQueryKeys } from './admin.keys';
import {
  getAdminStatsApi,
  getRecentActivitiesApi,
  getUsersApi,
  createUserApi,
  getLoginLogsApi,
  getScanLogsApi,
  type CreateUserRequest,
  type UsersQueryParams,
  type LogsQueryParams,
} from '@/api/admin';
import { isAuthError } from '@/api/fetch-wrapper';

// ===== 기본 설정 =====
const useAdminBase = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = isAuthenticated && user?.userType === 'admin';

  const baseQueryOptions = {
    enabled: isAdmin, // 관리자일 때만 쿼리 활성화
    retry: (failureCount: number, error: unknown) => {
      if (isAuthError(error)) return false; // 인증 에러 시 재시도 안함
      return failureCount < 2;
    },
    // Admin 페이지는 실시간성이 중요하므로 캐시 시간 단축
    staleTime: 2 * 60 * 1000, // 2분간 신선
    gcTime: 10 * 60 * 1000, // 10분간 캐시 보관
  };

  return { isAdmin, queryClient, baseQueryOptions };
};

// ===== Queries =====

export const useAdminStats = () => {
  const { baseQueryOptions } = useAdminBase();

  return useQuery({
    queryKey: adminQueryKeys.stats(),
    queryFn: () => getAdminStatsApi(getAccessToken()!),
    ...baseQueryOptions,
    staleTime: 60 * 1000, // 1분
    refetchInterval: 30 * 1000, // 30초마다 갱신
  });
};

export const useRecentActivities = (limit: number = 5) => {
  const { baseQueryOptions } = useAdminBase();

  return useQuery({
    queryKey: adminQueryKeys.activities(limit),
    queryFn: () => getRecentActivitiesApi(getAccessToken()!, limit),
    ...baseQueryOptions,
    staleTime: 30 * 1000, // 30초
  });
};

export const useUsers = (params: UsersQueryParams = {}) => {
  const { baseQueryOptions } = useAdminBase();

  return useQuery({
    queryKey: adminQueryKeys.users(params),
    queryFn: () => getUsersApi(getAccessToken()!, params),
    ...baseQueryOptions,
    placeholderData: keepPreviousData,
  });
};

export const useLoginLogs = (params: LogsQueryParams = {}) => {
  const { baseQueryOptions } = useAdminBase();

  return useQuery({
    queryKey: adminQueryKeys.loginLogs(params),
    queryFn: () => getLoginLogsApi(getAccessToken()!, params),
    ...baseQueryOptions,
    placeholderData: keepPreviousData,
  });
};

export const useScanLogs = (params: LogsQueryParams = {}) => {
  const { baseQueryOptions } = useAdminBase();

  return useQuery({
    queryKey: adminQueryKeys.scanLogs(params),
    queryFn: () => getScanLogsApi(getAccessToken()!, params),
    ...baseQueryOptions,
    placeholderData: keepPreviousData,
  });
};

// ===== Mutations =====

export const useCreateUser = () => {
  const { queryClient } = useAdminBase();

  return useMutation({
    mutationFn: (userData: CreateUserRequest) => createUserApi(getAccessToken()!, userData),
    onSuccess: () => {
      // 관련 데이터 무효화
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.stats() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.activities() });
    },
  });
};

// ===== 유틸리티 훅들 =====

export const useAdminGuard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const isAdmin = isAuthenticated && user?.userType === 'admin';

  return {
    isLoading,
    isAdmin,
    accessDenied: isAuthenticated && !isAdmin,
  };
};

// 전체 데이터 새로고침용
export const useAdminRefresh = () => {
  const { queryClient } = useAdminBase();

  return () => {
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.all });
  };
};
