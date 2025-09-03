import React from 'react';
import { useAuth } from '@/hooks/auth/useAuth';

export const UserProfile: React.FC = () => {
  const { user, logout, isLoggingOut, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
        <p className="text-slate-600 dark:text-slate-400">사용자 정보 로딩 중...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">사용자 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg dark:bg-slate-800">
      {/* 헤더 */}
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <svg
            className="h-8 w-8 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">인증 완료</h2>
        <p className="mt-1 text-slate-600 dark:text-slate-400">환영합니다, {user.fullName}님!</p>
      </div>

      {/* 사용자 정보 */}
      <div className="mb-6 space-y-4">
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700">
          <label className="text-sm text-slate-600 dark:text-slate-400">사용자명</label>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{user.username}</p>
        </div>

        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700">
          <label className="text-sm text-slate-600 dark:text-slate-400">이름</label>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{user.fullName}</p>
        </div>

        {user.teamName && (
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700">
            <label className="text-sm text-slate-600 dark:text-slate-400">소속팀</label>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {user.teamName} <span className="text-sm text-slate-500">({user.teamCode})</span>
            </p>
          </div>
        )}

        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-700">
          <label className="text-sm text-slate-600 dark:text-slate-400">권한</label>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            <span
              className={`rounded-full px-2 py-1 text-xs ${
                user.userType === 'admin'
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
              }`}
            >
              {user.userType === 'admin' ? '관리자' : '사용자'}
            </span>
          </p>
        </div>
      </div>

      {/* 로그아웃 버튼 */}
      <button
        onClick={() => logout()}
        disabled={isLoggingOut}
        className="w-full rounded-lg bg-red-600 px-4 py-3 font-bold text-white transition-colors hover:bg-red-700 focus:ring-4 focus:ring-red-300 focus:outline-none disabled:cursor-not-allowed disabled:bg-red-400"
      >
        {isLoggingOut ? (
          <div className="flex items-center justify-center">
            <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            로그아웃 중...
          </div>
        ) : (
          '로그아웃'
        )}
      </button>
    </div>
  );
};
