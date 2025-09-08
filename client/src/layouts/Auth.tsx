// 인증 체크 레이아웃
import { Outlet } from 'react-router';
import { useAuth } from '@/hooks/auth/useAuth.ts';
import { LoginForm } from '@/components/auth/LoginForm.tsx';
import { PageLoader } from '@/components/Loading.tsx';

export const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // 인증 상태 로딩 중
  if (isLoading) {
    return <PageLoader />;
  }

  // 미인증시 로그인 폼 표시
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    );
  }

  // 인증된 사용자는 하위 라우트 렌더링
  return <Outlet />;
};
