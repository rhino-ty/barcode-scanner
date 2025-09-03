export const ScanLogsPage = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">스캔 이력</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">바코드 스캔 이력을 확인하세요</p>
      </div>

      <div className="rounded-xl bg-white p-8 text-center shadow-lg dark:bg-slate-800">
        <div className="text-6xl">📊</div>
        <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">스캔 이력 준비 중...</h3>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          6단계에서 TanStack Table을 사용한 이력 조회 기능이 구현됩니다.
        </p>

        {/* 진행 상황 표시 */}
        <div className="mt-6 rounded-lg bg-slate-50 p-4 dark:bg-slate-700">
          <h4 className="font-medium text-slate-800 dark:text-slate-200">📋 구현 예정 기능</h4>
          <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <div>✅ 페이지네이션 테이블</div>
            <div>✅ 필터링 및 검색</div>
            <div>✅ 스캔 통계 대시보드</div>
            <div>✅ CSV 내보내기</div>
          </div>
        </div>
      </div>
    </div>
  );
};
