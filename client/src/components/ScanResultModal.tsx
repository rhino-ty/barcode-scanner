import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';

interface ScanResult {
  barcode: string;
  timestamp: Date;
}

interface ScanResultModalProps {
  scanResult: ScanResult;
  onClose: () => void;
}

export const ScanResultModal = ({ scanResult, onClose }: ScanResultModalProps) => {
  const { user } = useAuth();
  const [productCode, setProductCode] = useState(scanResult.barcode);
  const [isRegistering, setIsRegistering] = useState(false);

  // 스캔 성공시 클립보드에 자동 복사
  useEffect(() => {
    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(scanResult.barcode);
        console.log('바코드가 클립보드에 복사되었습니다:', scanResult.barcode);
      } catch (error) {
        console.error('클립보드 복사 실패:', error);
      }
    };

    copyToClipboard();
  }, [scanResult.barcode]);

  const handleRegister = async () => {
    if (!productCode.trim()) {
      alert('품번을 입력해주세요.');
      return;
    }

    setIsRegistering(true);

    try {
      // 외부 DB INSERT를 위한 데이터 준비
      const registrationData = {
        productCode: productCode.trim(),
        scannedBarcode: scanResult.barcode, // 원본 스캔된 바코드
        scannedAt: scanResult.timestamp,
        userId: user?.userId,
        username: user?.username,
        fullName: user?.fullName,
        teamCode: user?.teamCode,
        teamName: user?.teamName,
        ipAddress: 'client-ip', // 실제로는 서버에서 추출
        deviceInfo: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
      };

      console.log('외부 DB 등록 데이터:', registrationData);

      // TODO: 실제 외부 DB INSERT API 호출
      // await externalDbMutation.mutateAsync(registrationData);

      // 임시 지연 (실제 API 호출 시뮬레이션)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 성공 처리
      console.log('외부 DB 등록 성공');
      alert('품번이 성공적으로 등록되었습니다.');

      // 등록 완료 후 콜백 실행 (카메라 재시작 등)
      // onRegistered?.();
      onClose();
    } catch (error) {
      console.error('외부 DB 등록 실패:', error);
      alert('등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCancel = () => {
    console.log('등록 취소됨');
    onClose();
  };

  return (
    <>
      {/* 오버레이 */}
      <div className="fixed inset-0 z-50 bg-black/50" onClick={handleCancel} />

      {/* 모달 */}
      <div className="fixed inset-x-4 top-1/2 z-50 max-h-[90vh] -translate-y-1/2 overflow-y-auto rounded-xl bg-white shadow-xl md:inset-x-auto md:left-1/2 md:w-full md:max-w-md md:-translate-x-1/2 dark:bg-slate-800">
        {/* 헤더 */}
        <div className="border-b border-slate-200 p-6 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">스캔 결과 등록</h2>
            <button onClick={handleCancel} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-700">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 스캔 정보 */}
        <div className="border-b border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="text-center">
            <div className="mb-2 text-sm text-slate-600 dark:text-slate-400">
              스캔 시간: {scanResult.timestamp.toLocaleString('ko-KR')}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400">✓ 클립보드에 복사되었습니다</div>
          </div>
        </div>

        {/* 품번 입력 폼 */}
        <div className="p-6">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
              품번 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
              placeholder="품번을 입력하거나 수정하세요"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 font-mono text-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              disabled={isRegistering}
              autoFocus
            />
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              스캔된 바코드: <code className="rounded bg-slate-100 px-1 dark:bg-slate-700">{scanResult.barcode}</code>
            </div>
          </div>

          {/* 등록자 정보 */}
          <div className="mb-6 rounded-lg bg-slate-50 p-4 dark:bg-slate-700/50">
            <div className="text-sm text-slate-600 dark:text-slate-400">등록자</div>
            <div className="font-medium text-slate-900 dark:text-slate-100">
              {user?.fullName || 'Guest'} ({user?.teamName || 'Test'})
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleCancel}
            disabled={isRegistering}
            className="flex-1 py-4 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            취소
          </button>

          <div className="w-px bg-slate-200 dark:bg-slate-700"></div>

          <button
            onClick={handleRegister}
            disabled={!productCode.trim() || isRegistering}
            className="flex-1 bg-indigo-600 py-4 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRegistering ? (
              <div className="flex items-center justify-center">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                등록 중...
              </div>
            ) : (
              '등록'
            )}
          </button>
        </div>
      </div>
    </>
  );
};
