import { type ReactNode } from 'react';
import { useAdminGuard } from '@/hooks/admin/useAdmin';
import { LoadingSpinner } from '@/components/Loading';

interface AdminGuardProps {
  children: ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { isLoading, isAdmin, accessDenied } = useAdminGuard();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">🚫</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">접근 권한이 없습니다</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">관리자만 접근할 수 있는 페이지입니다.</p>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return <>{children}</>;
  }

  return null;
};
