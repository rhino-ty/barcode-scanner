// 인증이 필요한 API 호출시 자동으로 토큰 첨부 및 갱신 처리
import { apiRequest } from '@/api/fetch-wrapper';
import { getAccessToken, useAuth, useRefreshToken } from '@/hooks/auth/useAuth';

/**
 * 인증된 API 요청 훅
 * 401 에러시 자동으로 토큰 갱신 후 재시도
 */
export const useAuthRequest = () => {
  const { logout } = useAuth();
  const refreshMutation = useRefreshToken();

  const authRequest = async (url: string, options: RequestInit = {}) => {
    let accessToken = getAccessToken();

    if (!accessToken) {
      throw new Error('액세스 토큰이 없습니다. 로그인이 필요합니다.');
    }

    // 첫 번째 시도: 현재 토큰으로 요청
    try {
      return await apiRequest(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error: any) {
      // 401 에러시 토큰 갱신 시도
      if (error.status === 401) {
        console.log('🔄 401 에러 감지, 토큰 갱신 시도');

        try {
          // 토큰 갱신
          await refreshMutation.mutateAsync();
          accessToken = getAccessToken();

          if (!accessToken) {
            throw new Error('토큰 갱신 후에도 액세스 토큰이 없습니다');
          }

          // 갱신된 토큰으로 재시도
          return await apiRequest(url, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${accessToken}`,
            },
          });
        } catch (err) {
          // 갱신도 실패한 경우 로그아웃
          console.error('❌ 토큰 갱신 실패, 로그아웃 처리');
          logout();
          throw new Error(`${err} 세션이 만료되었습니다. 다시 로그인해주세요.`);
        }
      }

      // 401이 아닌 다른 에러는 그대로 throw
      throw error;
    }
  };

  return { authRequest };
};
