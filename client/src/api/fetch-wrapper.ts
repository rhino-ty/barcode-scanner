const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// NestJS 표준 응답 타입 정의
interface NestJSResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    statusCode: number;
    timestamp: string;
    path: string;
    method: string;
    details?: any;
  };
}

// 에러 타입 정의
interface ApiError extends Error {
  status: number;
  data?: NestJSResponse;
}

/**
 * 기본 fetch wrapper로서 모든 API 요청에 공통 로직 적용 (에러 처리, 로깅 등)
 * NestJS 표준 응답을 처리하는 fetch wrapper
 */
export const apiRequest = async <T = any>(url: string, options: RequestInit = {}): Promise<T> => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  const defaultOptions: RequestInit = {
    method: 'GET',
    ...options, // 사용자 옵션으로 덮어쓰기 (method 등)
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  console.log(`API 요청: ${defaultOptions.method || 'GET'} ${fullUrl}`);

  try {
    const response = await fetch(fullUrl, defaultOptions);

    // 응답 파싱
    let responseData: NestJSResponse<T>;
    try {
      responseData = await response.json();
    } catch (parseError) {
      throw createApiError(response.status, `응답 파싱 실패: ${response.statusText} ${(parseError as Error).message}`);
    }

    // HTTP 에러 처리
    if (!response.ok) {
      console.error(`API 에러 [${response.status}]:`, {
        url: fullUrl,
        method: defaultOptions.method || 'GET',
        status: response.status,
        message: responseData.message,
        details: responseData.error?.details,
      });

      throw createApiError(response.status, responseData.message || `HTTP ${response.status}`, responseData);
    }

    // 성공 응답 처리
    console.log(`API 성공:`, responseData.message || 'OK');

    // NestJS 표준 응답에서 data 추출
    if (responseData.success !== undefined && responseData.data !== undefined) {
      return responseData.data;
    }

    // 단순 응답인 경우 (success/data 구조가 없는 경우)
    return responseData as T;
  } catch (error) {
    // 네트워크 에러 등 기타 에러
    if (!(error as ApiError).status) {
      console.error(`네트워크 에러:`, (error as Error).message);
      throw createApiError(0, '네트워크 연결을 확인해주세요.');
    }

    throw error;
  }
};

/**
 * ApiError 생성 헬퍼 함수
 */
function createApiError(status: number, message: string, data?: NestJSResponse): ApiError {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.data = data;
  return error;
}

/**
 * 인증이 필요한 API 요청
 */
export const authenticatedRequest = async <T = any>(url: string, options: RequestInit = {}): Promise<T> => {
  const accessToken = localStorage.getItem('accessToken');

  return apiRequest<T>(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });
};

/**
 * 표준화된 에러 메시지 반환
 */
export const getErrorMessage = (error: unknown): string => {
  const apiError = error as ApiError;

  // HTTP 상태 코드별 메시지
  switch (apiError.status) {
    case 401:
      return '로그인이 필요합니다.';
    case 403:
      return '접근 권한이 없습니다.';
    case 404:
      return '요청한 리소스를 찾을 수 없습니다.';
    case 409:
      return apiError.message || '중복된 데이터입니다.';
    case 422:
      return '입력한 데이터가 올바르지 않습니다.';
    case 500:
      return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    case 0:
      return '네트워크 연결을 확인해주세요.';
    default:
      return apiError.message || '알 수 없는 오류가 발생했습니다.';
  }
};

/**
 * 에러가 특정 상태 코드인지 체크
 */
export const isApiError = (error: unknown, status: number): boolean => {
  return (error as ApiError)?.status === status;
};

/**
 * 인증 관련 에러인지 체크
 */
export const isAuthError = (error: unknown): boolean => {
  const status = (error as ApiError)?.status;
  return status === 401 || status === 403;
};
