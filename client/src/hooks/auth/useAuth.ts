import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { loginApi, refreshTokenApi, userProfileQueryOptions } from '@/api/auth';

// ===== 토큰 관리 (메모리 상태) =====
let accessTokenState: string | null = null;

export const getAccessToken = () => accessTokenState;
export const setAccessToken = (token: string | null) => {
  accessTokenState = token;
};

// 초기화 플래그 (중복 실행 방지)
let isInitialized = false;

/**
 * 로그인 훅
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginApi,

    onSuccess: (data) => {
      // 토큰 저장
      setAccessToken(data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      // 사용자 정보 캐시 설정 (네트워크 요청 절약)
      queryClient.setQueryData(userProfileQueryOptions(data.accessToken).queryKey, data.user);

      // 모든 인증 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },

    onError: (error: any) => {
      console.error('로그인 실패:', error.message);
      // 실패시 토큰 정리
      setAccessToken(null);
      localStorage.removeItem('refreshToken');
    },
  });
};

/**
 * 로그아웃 훅
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // 서버 로그아웃 API 호출 (선택사항)
      // await apiRequest('/auth/logout', { method: 'POST' });
    },

    onSettled: () => {
      // 성공/실패 관계없이 클라이언트 정리
      setAccessToken(null);
      localStorage.removeItem('refreshToken');
      queryClient.clear();

      // 초기화 플래그 리셋
      isInitialized = false;
    },
  });
};

/**
 * 토큰 갱신 훅
 */
export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('리프레시 토큰이 없습니다');
      }
      return refreshTokenApi(refreshToken);
    },

    onSuccess: (data) => {
      // 새 토큰으로 업데이트
      setAccessToken(data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      // 사용자 정보도 업데이트
      queryClient.setQueryData(userProfileQueryOptions(data.accessToken).queryKey, data.user);
    },

    onError: () => {
      // 갱신 실패시 완전 로그아웃
      setAccessToken(null);
      localStorage.removeItem('refreshToken');
      queryClient.clear();
      isInitialized = false;
    },
  });
};

/**
 * 현재 사용자 정보 훅
 */
export const useCurrentUser = () => {
  const accessToken = getAccessToken();

  return useQuery({
    ...userProfileQueryOptions(accessToken),
    // 토큰이 없으면 쿼리 비활성화
    enabled: !!accessToken,
  });
};

/**
 * 통합 인증 훅 - 모든 인증 기능을 한 곳에서 관리
 */
export const useAuth = () => {
  const currentUser = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const refreshMutation = useRefreshToken();

  // 앱 시작시 인증 복원 (중복 실행 방지)
  useEffect(() => {
    if (isInitialized) return;

    const initAuth = async () => {
      const refreshToken = localStorage.getItem('refreshToken');

      // 리프레시 토큰은 있지만 액세스 토큰이 없는 경우
      if (refreshToken && !getAccessToken()) {
        try {
          await refreshMutation.mutateAsync();
        } catch (error) {
          console.error(error);
          // 복원 실패시 리프레시 토큰도 제거
          localStorage.removeItem('refreshToken');
        }
      }

      isInitialized = true;
    };

    initAuth();
  }, [refreshMutation]);

  return {
    // 상태
    user: currentUser.data,
    isAuthenticated: !!currentUser.data && !!getAccessToken(),
    isLoading: currentUser.isPending || (refreshMutation.isPending && !isInitialized),

    // 액션
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,

    // 개별 로딩 상태
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,

    // 에러 상태
    loginError: loginMutation.error,
    authError: currentUser.error,

    // 유틸리티
    refetchUser: currentUser.refetch,
    refreshToken: refreshMutation.mutate,
  };
};
