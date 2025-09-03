const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * 기본 fetch wrapper로서 모든 API 요청에 공통 로직 적용합니다. (에러 처리, 로깅 등)
 */
export const apiRequest = async (url: string, options: RequestInit = {}): Promise<any> => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  console.log(`API 요청: ${defaultOptions.method || 'GET'} ${fullUrl}`);

  try {
    const response = await fetch(fullUrl, defaultOptions);

    // HTTP 에러 처리
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP ${response.status}`);
      (error as any).status = response.status;
      (error as any).data = errorData;
      throw error;
    }

    const data = await response.json();
    console.log(`API 성공:`, data);

    return data;
  } catch (error) {
    console.error(`API 에러:`, error);
    throw error;
  }
};

/**
 * 인증이 필요한 API 요청 함수입니다. 나중에 토큰을 자동으로 첨부하는 용도로 사용합니다.
 */
export const authenticatedRequest = async (url: string, options: RequestInit = {}) => {
  // 나중에 토큰 로직 추가 예정
  const accessToken = localStorage.getItem('accessToken'); // 임시

  return apiRequest(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });
};
