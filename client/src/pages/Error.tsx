import { useRouteError, Link } from 'react-router'; // v7

export const ErrorPage = () => {
  const error = useRouteError() as any;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <div className="text-6xl">😵</div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-slate-100">앗! 문제가 발생했습니다</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          {error?.statusText || error?.message || '알 수 없는 오류가 발생했습니다.'}
        </p>

        {/* 에러 상세 정보 (개발 모드) */}
        {import.meta.env.DEV && error?.stack && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-slate-500">에러 상세 정보 (개발 모드)</summary>
            <pre className="mt-2 overflow-x-auto rounded bg-slate-100 p-2 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {error.stack}
            </pre>
          </details>
        )}

        <Link to="/" className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
};
