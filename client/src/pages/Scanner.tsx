export const ScannerPage = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">바코드 스캐너</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">CODE128 바코드를 스캔하세요</p>
      </div>

      <div className="rounded-xl bg-white p-8 text-center shadow-lg dark:bg-slate-800">
        <div className="text-6xl">📷</div>
        <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">바코드 스캐너 준비 중...</h3>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          5단계에서 Quagga2 라이브러리를 사용한 스캐너 기능이 구현됩니다.
        </p>

        {/* 진행 상황 표시 */}
        <div className="mt-6 rounded-lg bg-slate-50 p-4 dark:bg-slate-700">
          <h4 className="font-medium text-slate-800 dark:text-slate-200">🚀 구현 예정 기능</h4>
          <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <div>✅ 카메라 접근 및 스트림 제어</div>
            <div>✅ CODE128 바코드 인식</div>
            <div>✅ 스캔 결과 자동 복사</div>
            <div>✅ 스캔 로그 서버 전송</div>
          </div>
        </div>
      </div>
    </div>
  );
};
