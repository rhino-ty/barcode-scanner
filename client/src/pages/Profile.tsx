import InfoCard from '@/components/InfoCard.tsx';
import { useAuth } from '@/hooks/auth/useAuth.ts';

export const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <div className="mx-auto max-w-md">
        {/* 📋 사용자 정보 헤더 */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">사용자 정보</h1>
        </div>

        {/* 📊 정보 카드들 */}
        <div className="space-y-4">
          <InfoCard label="이름" value={user?.fullName || 'Guest User'} />
          <InfoCard label="사용자명" value={user?.username || 'guest'} />
          <InfoCard label="소속팀" value={user?.teamName || 'Test Team'} />
          <InfoCard label="권한" value={user?.userType === 'admin' ? '관리자' : '일반 사용자'} />
          <InfoCard label="상태" value="활성" />
        </div>

        {/* 🔧 개발 모드 정보 */}
        {import.meta.env.DEV && (
          <div className="mt-8 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <h3 className="mb-2 text-sm font-medium text-yellow-800 dark:text-yellow-300">🛠️ 개발 모드 정보</h3>
            <pre className="text-xs text-yellow-700 dark:text-yellow-400">{JSON.stringify(user, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
