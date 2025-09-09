import React from 'react';

export const ScannerUsageGuide: React.FC = () => {
  return (
    <div className="mt-6 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <h3 className="mb-3 text-lg font-bold text-slate-800 dark:text-slate-100">💡 사용 가이드</h3>
      <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2 dark:text-slate-400">
        <div className="flex items-start">
          <span className="mr-2 text-green-500">•</span>
          <span>바코드를 화면 중앙에 맞춰주세요</span>
        </div>
        <div className="flex items-start">
          <span className="mr-2 text-green-500">•</span>
          <span>바코드와 10-20cm 거리 유지</span>
        </div>
        <div className="flex items-start">
          <span className="mr-2 text-green-500">•</span>
          <span>충분한 조명 확보</span>
        </div>
        <div className="flex items-start">
          <span className="mr-2 text-green-500">•</span>
          <span>CODE128 바코드만 지원</span>
        </div>
      </div>
    </div>
  );
};
