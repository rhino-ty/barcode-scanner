import { useAdminRefresh } from '@/hooks/admin/useAdmin';

export const AdminHeader = () => {
  const refreshAll = useAdminRefresh();

  return (
    <div className="flex items-center justify-between">
      <div className="text-center md:text-left">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl dark:text-slate-100">관리자 페이지</h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">시스템 현황 및 사용자 관리</p>
      </div>

      <button
        onClick={refreshAll}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      >
        <span className="mr-2">🔄</span>
        새로고침
      </button>
    </div>
  );
};
