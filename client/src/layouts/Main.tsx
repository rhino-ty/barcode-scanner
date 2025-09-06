import { Outlet, Link, useLocation } from 'react-router';
import { useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth.ts';

export const MainLayout = () => {
  const location = useLocation();
  const { user, logout, isLoggingOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // 현재 경로 체크 함수
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
  };

  // 업무 메뉴 그룹
  const workMenuItems = [
    { path: '/', label: '바코드 스캔', icon: '📷' },
    // { path: '/scan-logs', label: '스캔 통계', icon: '📊' },
    ...(user?.userType === 'admin' ? [{ path: '/admin', label: '관리자', icon: '⚙️' }] : []),
  ];

  // 개인 메뉴 그룹 (사이드바 전용)
  const personalMenuItems = [{ path: '/profile', label: '내 정보', icon: '👤' }];

  // 하단 탭 메뉴 (모바일 전용)
  const bottomTabItems = [
    { path: '/', label: '스캔', icon: '📷' },
    // { path: '/scan-logs', label: '통계', icon: '📊' },
    ...(user?.userType === 'admin' ? [{ path: '/admin', label: '관리자', icon: '⚙️' }] : []),
    { path: '/profile', label: '내정보', icon: '👤' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* 🖥️ 데스크톱/태블릿 사이드바 (≥768px) */}
      <aside className="hidden w-64 border-r border-slate-200 bg-white md:block dark:border-slate-700 dark:bg-slate-800">
        <div className="flex h-full flex-col">
          {/* 로고 & 사용자 정보 */}
          <div className="border-b border-slate-200 p-6 dark:border-slate-700">
            <Link
              to="/"
              className="mb-4 block text-xl font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              바코드 스캐너
            </Link>

            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex w-full items-center rounded-lg p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-900 dark:text-slate-100">{user?.fullName}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{user?.teamName}</div>
              </div>
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* 사용자 드롭다운 메뉴 */}
            {showUserMenu && (
              <div className="mt-2 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-700">
                <Link
                  to="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  <span className="mr-3">👤</span>내 정보
                </Link>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  disabled={isLoggingOut}
                  className="flex w-full items-center px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  <span className="mr-3">🚪</span>
                  {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
                </button>
              </div>
            )}
          </div>

          {/* 업무 메뉴 그룹 */}
          <nav className="flex-1 p-4">
            <div className="mb-6">
              <div className="mb-3 px-3 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                업무
              </div>
              <div className="space-y-1">
                {workMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100'
                    }`}
                  >
                    <span className="mr-3 text-base">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* 개인 메뉴 그룹 */}
            <div>
              <div className="mb-3 px-3 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                개인
              </div>
              <div className="space-y-1">
                {personalMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100'
                    }`}
                  >
                    <span className="mr-3 text-base">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                >
                  <span className="mr-3 text-base">🚪</span>
                  {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
                </button>
              </div>
            </div>
          </nav>
        </div>
      </aside>

      {/* 📱 모바일 레이아웃 */}
      <div className="flex flex-1 flex-col md:ml-0">
        {/* 📱 모바일 상단 헤더 (<768px) */}
        <header className="border-b border-slate-200 bg-white p-4 md:hidden dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center justify-between">
            {/* 로고 */}
            <Link to="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
              바코드 스캐너
            </Link>

            {/* 사용자명 버튼 */}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.fullName}</span>
              <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* 모바일 사용자 드롭다운 */}
          {showUserMenu && (
            <div className="mt-2 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-700">
              <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-600">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.fullName}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{user?.teamName}</div>
                {user?.userType === 'admin' && (
                  <div className="text-xs text-purple-600 dark:text-purple-400">👑 관리자</div>
                )}
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                disabled={isLoggingOut}
                className="flex w-full items-center px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                <span className="mr-3">🚪</span>
                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
              </button>
            </div>
          )}
        </header>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 p-4 pb-20 md:p-8 md:pb-8">
          <Outlet />
        </main>

        {/* 📱 모바일 하단 탭 네비게이션 (<768px) */}
        <nav className="fixed right-0 bottom-0 left-0 border-t border-slate-200 bg-white md:hidden dark:border-slate-700 dark:bg-slate-800">
          <div className="flex">
            {bottomTabItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-1 flex-col items-center py-3 text-xs font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                <span className="mb-1 text-xl">{item.icon}</span>
                <span className="truncate">{item.label}</span>
                {isActive(item.path) && (
                  <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
                )}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};
