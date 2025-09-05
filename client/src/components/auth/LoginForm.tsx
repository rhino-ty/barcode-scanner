import React, { useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';

export const LoginForm: React.FC = () => {
  const { login, isLoggingIn, loginError } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      return;
    }

    login(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg dark:bg-slate-800">
      {/* 헤더 */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30">
          <svg
            className="h-8 w-8 text-indigo-600 dark:text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">로그인</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">아르네 출하관리 시스템</p>
      </div>

      {/* 폼 */}
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">사용자명</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            disabled={isLoggingIn}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            placeholder="사용자명을 입력하세요"
            autoComplete="username"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">비밀번호</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoggingIn}
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            placeholder="비밀번호를 입력하세요"
            autoComplete="current-password"
          />
        </div>

        {/* 에러 메시지 */}
        {loginError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/30">
            <p className="text-sm text-red-700 dark:text-red-400">{loginError?.message || '로그인에 실패했습니다.'}</p>
          </div>
        )}

        {/* 로그인 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={isLoggingIn || !formData.username || !formData.password}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-bold text-white transition-colors hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 focus:outline-none disabled:cursor-not-allowed disabled:bg-indigo-400"
        >
          {isLoggingIn ? (
            <div className="flex items-center justify-center">
              <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              로그인 중...
            </div>
          ) : (
            '로그인'
          )}
        </button>
      </div>
    </div>
  );
};
