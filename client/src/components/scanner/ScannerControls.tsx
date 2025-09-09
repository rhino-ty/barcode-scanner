import React from 'react';

interface ScannerControlsProps {
  scannerState: 'idle' | 'loading' | 'scanning' | 'success' | 'error';
  selectedCamera: string;
  onStartStop: () => void;
  onReset: () => void;
}

/**
 * 스캐너 컨트롤 컴포넌트
 * @param param0 스캐너 상태, 선택된 카메라, 시작/중지 및 초기화 핸들러
 * @returns JSX.Element
 */
export const ScannerControls: React.FC<ScannerControlsProps> = ({
  scannerState,
  selectedCamera,
  onStartStop,
  onReset,
}) => {
  const isScanning = scannerState === 'scanning';
  const isDisabled = scannerState === 'success' || scannerState === 'loading' || !selectedCamera;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <button
        onClick={onStartStop}
        disabled={isDisabled}
        className={`flex cursor-pointer items-center justify-center gap-3 rounded-xl px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 focus:ring-4 focus:outline-none ${
          isScanning
            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-300'
            : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300'
        } disabled:cursor-not-allowed disabled:bg-slate-400 disabled:hover:scale-100 dark:disabled:bg-slate-600`}
      >
        {isScanning ? '스캔 중지' : '스캔 시작'}
      </button>

      <button
        onClick={onReset}
        className="flex cursor-pointer items-center justify-center gap-3 rounded-xl bg-slate-200 px-6 py-4 text-lg font-semibold text-slate-700 shadow-lg transition-all hover:scale-105 hover:bg-slate-300 focus:ring-4 focus:ring-slate-300 focus:outline-none dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:focus:ring-slate-500"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        초기화
      </button>
    </div>
  );
};
