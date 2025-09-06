import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { router } from '@/router.tsx';

// QueryClient 인스턴스 생성 (앱 전체에서 하나만 사용)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5분간 데이터를 신선하다고 간주 (재요청 안함)
      staleTime: 5 * 60 * 1000,
      // 10분간 메모리에 캐시 보관
      gcTime: 10 * 60 * 1000, // v5 기준
      // 브라우저 포커스시 자동 재요청 비활성화 (모바일에서 방해됨)
      refetchOnWindowFocus: false,
      // 네트워크 재연결시 재요청 (오프라인 → 온라인)
      refetchOnReconnect: true,
      // 401/403 에러는 재시도 안함, 나머지는 3회까지
      retry: (failureCount, error: any) => {
        if ([401, 403, 404].includes(error?.status)) return false;
        return failureCount < 3;
      },
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />

      {/* 개발환경에서만 DevTools 표시 */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />}
    </QueryClientProvider>
  );
}
