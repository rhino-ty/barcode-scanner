import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { loginApi, refreshTokenApi, userProfileQueryOptions } from '@/api/auth';

// 토큰 관리 (메모리 상태)
let accessTokenState: string | null = null;

export const getAccessToken = () => accessTokenState;
export const setAccessToken = (token: string | null) => {
  accessTokenState = token;
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      queryClient.setQueryData(userProfileQueryOptions(data.accessToken).queryKey, data.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      navigate('/', { replace: true });
    },
    onError: (error: Error) => {
      console.error('로그인 실패:', error.message);
      setAccessToken(null);
      localStorage.removeItem('refreshToken');
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      // 서버 로그아웃 API 호출은 따로
    },
    onSettled: () => {
      setAccessToken(null);
      localStorage.removeItem('refreshToken');
      queryClient.clear();
      navigate('/', { replace: true });
    },
  });
};

export const useRefreshToken = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('리프레시 토큰이 없습니다');
      }
      return refreshTokenApi(refreshToken);
    },
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      queryClient.setQueryData(userProfileQueryOptions(data.accessToken).queryKey, data.user);
    },
    onError: (error) => {
      alert('인증이 만료되었습니다. 다시 로그인해주세요.');
      // 갱신 실패시 완전 로그아웃
      console.error('토큰 갱신 실패:', error);
      setAccessToken(null);
      localStorage.removeItem('refreshToken'); // 만료된 토큰 제거
      queryClient.clear();
      navigate('/', { replace: true });
    },
  });
};

export const useCurrentUser = () => {
  const accessToken = getAccessToken();

  return useQuery({
    ...userProfileQueryOptions(accessToken),
    // 토큰이 없으면 쿼리 비활성화
    enabled: !!accessToken,
  });
};

export const useAuth = () => {
  const [initState, setInitState] = useState<'idle' | 'loading' | 'done' | 'failed'>('idle');
  const currentUser = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const refreshMutation = useRefreshToken();

  // 앱 시작시 인증 복원 (중복 실행 방지)
  useEffect(() => {
    if (initState !== 'idle') return;

    const initAuth = async () => {
      setInitState('loading');

      const refreshToken = localStorage.getItem('refreshToken');
      const accessToken = getAccessToken();

      // 리프레시 토큰은 있지만 액세스 토큰이 없는 경우
      if (refreshToken && !accessToken) {
        try {
          await refreshMutation.mutateAsync();
          setInitState('done');
        } catch (error) {
          console.warn(error, '토큰 복원 실패, 로그인 필요');
          setInitState('failed');
        }
      } else {
        setInitState('done');
      }
    };

    initAuth();
  }, [refreshMutation, initState]);

  return {
    // 상태
    user: currentUser.data,
    isAuthenticated: !!currentUser.data && !!getAccessToken(),
    isLoading: initState === 'loading',

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

    // 디버깅용
    _initState: initState,
  };
};
