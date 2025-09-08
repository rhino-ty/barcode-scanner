interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean; // 첫/마지막 페이지 버튼 표시 여부
  maxVisiblePages?: number; // 표시할 최대 페이지 번호 개수
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxVisiblePages = 5,
}: PaginationProps) => {
  // 표시할 페이지 번호들 계산
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();

  // 빈 상태 처리
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center space-x-1">
      {/* 첫 페이지 버튼 */}
      {showFirstLast && currentPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-700"
            title="첫 페이지"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          {visiblePages[0] > 2 && <span className="px-2 text-slate-400 dark:text-slate-500">…</span>}
        </>
      )}

      {/* 이전 버튼 */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-700 dark:disabled:hover:border-slate-600 dark:disabled:hover:bg-slate-800"
        title="이전 페이지"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* 페이지 번호들 */}
      {visiblePages.map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:outline-none ${
            pageNum === currentPage
              ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600'
              : 'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-700'
          }`}
        >
          {pageNum}
        </button>
      ))}

      {/* 다음 버튼 */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:bg-white dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-700 dark:disabled:hover:border-slate-600 dark:disabled:hover:bg-slate-800"
        title="다음 페이지"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* 마지막 페이지 버튼 */}
      {showFirstLast && currentPage < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className="px-2 text-slate-400 dark:text-slate-500">…</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-700"
            title="마지막 페이지"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};
