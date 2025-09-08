import React, { useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { useLocation, useNavigate } from 'react-router';

export const LoginForm: React.FC = () => {
  const { login, isLoggingIn, loginError } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.pathname || '/';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      return;
    }

    login(formData, {
      onSuccess: () => {
        navigate(from, { replace: true });
      },
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const isFormValid = formData.username && formData.password;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="fixed inset-0 flex flex-col bg-slate-50 md:relative md:inset-auto md:min-h-0 md:w-full md:max-w-md md:rounded-xl md:bg-white md:shadow-lg dark:bg-slate-900 dark:md:bg-slate-800"
    >
      {/* 스크롤 가능 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto px-6 pt-16 pb-8 md:overflow-visible md:px-8 md:pt-8">
        {/* 헤더 */}
        <div className="mb-12 text-center md:mb-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 md:mb-4 md:h-16 md:w-16 dark:bg-indigo-900/30">
            <svg
              className="h-10 w-10 text-indigo-600 md:h-8 md:w-8 dark:text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 md:text-3xl dark:text-slate-100">로그인</h1>
          <p className="mt-3 text-lg text-slate-600 md:mt-2 md:text-base dark:text-slate-400">출하관리 시스템</p>
        </div>

        {/* 폼 */}
        <div className="space-y-8 md:space-y-6">
          <div>
            <label
              htmlFor="username"
              className="mb-3 block text-base font-medium text-slate-700 md:mb-2 md:text-sm dark:text-slate-300"
            >
              사용자명{' '}
              <span className="text-red-500" aria-label="필수 입력">
                *
              </span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoggingIn}
              required
              autoFocus
              aria-required="true"
              aria-invalid={loginError ? 'true' : 'false'}
              aria-describedby={loginError ? 'login-error' : undefined}
              className="w-full rounded-xl border border-slate-300 px-5 py-4 text-lg focus:border-transparent focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 md:rounded-lg md:px-4 md:py-3 md:text-base dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              placeholder="사용자명을 입력하세요"
              autoComplete="username"
              spellCheck={false}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-3 block text-base font-medium text-slate-700 md:mb-2 md:text-sm dark:text-slate-300"
            >
              비밀번호{' '}
              <span className="text-red-500" aria-label="필수 입력">
                *
              </span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoggingIn}
              required
              aria-required="true"
              aria-invalid={loginError ? 'true' : 'false'}
              aria-describedby={loginError ? 'login-error' : undefined}
              className="w-full rounded-xl border border-slate-300 px-5 py-4 text-lg focus:border-transparent focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 md:rounded-lg md:px-4 md:py-3 md:text-base dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
            />
          </div>

          {/* 에러 메시지 */}
          {loginError && (
            <div
              id="login-error"
              className="rounded-xl border border-red-200 bg-red-50 p-5 md:rounded-lg md:p-4 dark:border-red-800 dark:bg-red-900/30"
              role="alert"
              aria-live="polite"
            >
              <p className="text-base text-red-700 md:text-sm dark:text-red-400">
                {loginError?.message || '로그인에 실패했습니다.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 하단 고정 버튼 영역 */}
      <div className="border-t border-slate-200 bg-white p-6 md:border-0 md:bg-transparent md:p-8 md:pt-0 dark:border-slate-700 dark:bg-slate-800 md:dark:bg-transparent">
        <button
          type="submit"
          disabled={isLoggingIn || !isFormValid}
          aria-describedby={loginError ? 'login-error' : undefined}
          className="w-full rounded-xl bg-indigo-600 px-6 py-5 text-xl font-bold text-white transition-all hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 focus:outline-none active:scale-95 disabled:cursor-not-allowed disabled:bg-indigo-400 md:rounded-lg md:px-4 md:py-3 md:text-lg"
        >
          {isLoggingIn ? (
            <div className="flex items-center justify-center">
              <div
                className="mr-3 h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent md:mr-2 md:h-5 md:w-5"
                aria-hidden="true"
              />
              <span className="sr-only">로그인 처리 중입니다. 잠시만 기다려주세요.</span>
              로그인 중...
            </div>
          ) : (
            '로그인'
          )}
        </button>

        {/* 추가 정보 - 모바일에서만 표시 */}
        <div className="mt-4 text-center md:hidden">
          <p className="text-sm text-slate-500 dark:text-slate-400">처음 사용하시나요? 관리자에게 계정을 요청하세요</p>
        </div>
      </div>

      {/* 로딩 중일 때 스크린 리더용 라이브 영역 */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {isLoggingIn && '로그인 중입니다.'}
      </div>
    </form>
  );
};
