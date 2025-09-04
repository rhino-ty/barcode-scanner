import { useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { ScanResultModal } from '@/components/ScanResultModal';

interface ScanResult {
  barcode: string;
  timestamp: Date;
  // 추가 데이터는 5단계에서
}

export const ScannerPage = () => {
  const { user } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // 임시 스캔 시뮬레이션 (5단계에서 실제 구현)
  const handleStartScan = () => {
    setIsScanning(true);
    // 2초 후 더미 결과 반환
    setTimeout(() => {
      setScanResult({
        barcode: 'TEST' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        timestamp: new Date(),
      });
      setIsScanning(false);
    }, 2000);
  };

  const handleCloseScanModal = () => {
    setScanResult(null);
  };

  return (
    <div className="flex h-full flex-col">
      {/* 🎯 스캔 영역 */}
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        {isScanning ? (
          /* 📷 스캔 중 UI */
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-64 w-full max-w-sm items-center justify-center rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/20">
              <div className="text-center">
                <div className="mb-2 animate-pulse text-4xl">📷</div>
                <div className="text-indigo-600 dark:text-indigo-400">카메라 스캔 중...</div>
                <div className="mt-2 h-1 w-32 overflow-hidden rounded-full bg-indigo-200 dark:bg-indigo-800">
                  <div className="h-full animate-pulse rounded-full bg-indigo-500"></div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsScanning(false)}
              className="rounded-lg bg-red-600 px-6 py-3 text-white hover:bg-red-700"
            >
              스캔 중지
            </button>
          </div>
        ) : (
          /* 🎯 스캔 대기 UI */
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-64 w-full max-w-sm items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              <div className="text-center">
                <div className="mb-4 text-6xl">📦</div>
                <div className="text-slate-600 dark:text-slate-400">바코드를 스캔하세요</div>
              </div>
            </div>

            <button
              onClick={handleStartScan}
              className="mb-4 rounded-xl bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-indigo-700 active:scale-95"
            >
              📷 스캔 시작
            </button>

            <div className="text-sm text-slate-500 dark:text-slate-400">출하할 제품의 바코드를 스캔해주세요</div>
          </div>
        )}
      </div>

      {/* 📊 하단 상태 정보 */}
      <div className="border-t border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-slate-600 dark:text-slate-400">
              {user?.fullName || 'Guest'} | {user?.teamName || 'Test Mode'}
            </span>
          </div>
          <div className="text-slate-500 dark:text-slate-500">{new Date().toLocaleTimeString('ko-KR')}</div>
        </div>
      </div>

      {/* 📝 스캔 결과 모달 */}
      {scanResult && <ScanResultModal scanResult={scanResult} onClose={handleCloseScanModal} />}
    </div>
  );
};
