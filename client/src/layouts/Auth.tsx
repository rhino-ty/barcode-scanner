// 인증 체크 레이아웃
import { Outlet, useNavigate } from 'react-router';
import { useAuth } from '@/hooks/auth/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import { PageLoader } from '@/components/Loading';
import { useEffect } from 'react';

export const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // 인증 상태 변화 감지 및 URL 동기화
  useEffect(() => {
    if (isLoading) return;

    // 인증되지 않은 상태에서 보호된 경로에 있으면 루트로 리다이렉트
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

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
