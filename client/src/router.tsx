import { createBrowserRouter } from 'react-router';
import { AuthLayout } from '@/layouts/Auth.tsx';
import { MainLayout } from '@/layouts/Main.tsx';
import { ScannerPage } from '@/pages/Scanner.tsx';
import { ErrorPage } from '@/pages/Error.tsx';
import { ProfilePage } from '@/pages/Profile.tsx';
import { AdminPage } from '@/pages/Admin.tsx';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AuthLayout />, // 인증 보호 래퍼
      errorElement: <ErrorPage />,
      children: [
        {
          path: '/',
          element: <MainLayout />, // 메인 레이아웃 (헤더 + 컨텐츠)
          children: [
            {
              index: true, // path: '/' 메인 페이지는 바로 스캐너
              element: <ScannerPage />,
            },
            {
              path: 'profile',
              element: <ProfilePage />,
            },
            {
              path: 'admin',
              element: <AdminPage />,
            },
          ],
        },
      ],
    },
    // 모든 미매칭 경로: 에러 페이지
    {
      path: '*',
      element: <ErrorPage />,
    },
  ],
  {
    // v7 옵션: 베이스 경로 설정 (필요시)
    // basename: '/barcode-scanner',

    // v7 미래 플래그
    future: {
      v7_fetcherPersist: true, // Fetcher 지속성 개선
      v7_normalizeFormMethod: true, // 폼 메서드 정규화
      v7_partialHydration: true, // 부분 하이드레이션 지원
      v7_relativeSplatPath: true, // 상대 경로 개선
      v7_skipActionErrorRevalidation: true, // 액션 에러시 재검증 스킵
    },
  },
);
