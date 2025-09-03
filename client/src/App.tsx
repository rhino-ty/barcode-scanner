import { useAuth } from '@/hooks/auth/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import { UserProfile } from '@/components/auth/UserProfile';
import { PageLoader } from '@/components/loading';

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // 인증 상태 로딩 중
  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            🚀 2단계: TanStack Query 인증 시스템
          </h1>
          <p className="text-slate-600 dark:text-slate-400">완전한 인증 관리 시스템 구현 완료</p>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="flex justify-center">{isAuthenticated ? <UserProfile /> : <LoginForm />}</div>

        {/* 구현 정보 */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
          <h3 className="mb-4 text-lg font-semibold text-blue-800 dark:text-blue-300">2단계에서 구현된 기능들</h3>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium text-blue-700 dark:text-blue-300">인증 관리</h4>
              <ul className="space-y-1 text-blue-600 dark:text-blue-400">
                <li>• TanStack Query 기반 상태 관리</li>
                <li>• 메모리 기반 액세스 토큰 (XSS 보안)</li>
                <li>• localStorage 리프레시 토큰</li>
                <li>• 자동 토큰 갱신 및 재시도</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-medium text-blue-700 dark:text-blue-300">🎯 구조 개선</h4>
              <ul className="space-y-1 text-blue-600 dark:text-blue-400">
                <li>• queryOptions로 타입 안전성</li>
                <li>• 커스텀 훅으로 로직 분리</li>
                <li>• 컴포넌트 재사용성 향상</li>
                <li>• API 인터셉터 자동화</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
