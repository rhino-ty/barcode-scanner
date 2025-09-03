import { Outlet, Link, useLocation } from 'react-router';
import { useAuth } from '@/hooks/auth/useAuth';

export const MainLayout = () => {
  const location = useLocation();
  const { user, logout, isLoggingOut } = useAuth();

  // 현재 경로 체크 함수
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // 네비게이션 메뉴 아이템
  const navItems = [
    { path: '/', label: '홈', icon: '🏠' },
    { path: '/scanner', label: '바코드 스캐너', icon: '📷' },
    { path: '/scan-logs', label: '스캔 이력', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 네비게이션 바 */}
      <nav className="border-b border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            {/* 로고 */}
            <Link
              to="/"
              className="text-xl font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              바코드 스캐너
            </Link>

            {/* 메뉴 */}
            <div className="hidden space-x-1 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>

            {/* 사용자 정보 & 로그아웃 */}
            <div className="flex items-center space-x-4">
              <span className="hidden text-sm text-slate-600 sm:block dark:text-slate-400">
                안녕하세요, {user?.fullName}님
              </span>
              <button
                onClick={() => logout()}
                disabled={isLoggingOut}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-700 disabled:bg-red-400"
              >
                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
              </button>
            </div>
          </div>

          {/* 모바일 메뉴 */}
          <div className="border-t border-slate-200 py-3 md:hidden dark:border-slate-700">
            <div className="flex space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="text-lg">{item.icon}</div>
                  <div className="text-xs">{item.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};
