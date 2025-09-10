// pages/QRScanner.tsx
import { Scanner } from '@yudiel/react-qr-scanner';
import { useCamera } from '@/hooks/scanner/useCamera';
import { useQRScanner } from '@/hooks/scanner/useQRScanner';
import { ScannerControls } from '@/components/scanner/ScannerControls';
import { CameraSelector } from '@/components/scanner/CameraSelector';
import { QRResultModal } from '@/components/scanner/QRResultModal';
import { getOptimizedConstraints } from '@/utils/scanner/scannerConfig';

export const QRScannerPage = () => {
  const { cameras, selectedCamera, setSelectedCamera } = useCamera();
  const { scannerState, qrResult, error, startScanning, stopScanning, resetScanner, handleDetection } = useQRScanner({
    selectedCamera,
  });

  const handleStartStop = () => {
    if (scannerState === 'scanning') {
      stopScanning();
    } else {
      startScanning();
    }
  };

  const handleCameraChange = (deviceId: string) => {
    stopScanning();
    setSelectedCamera(deviceId);
  };

  const handleCloseResult = () => {
    resetScanner();
    // 자동 재시작
    setTimeout(() => {
      startScanning();
    }, 300);
  };

  // 카메라 제약 조건 (기존 로직 재사용)
  const constraints = selectedCamera ? getOptimizedConstraints(selectedCamera) : undefined;

  return (
    <div className="flex h-full flex-col">
      <ScannerControls
        scannerState={scannerState}
        selectedCamera={selectedCamera}
        onStartStop={handleStartStop}
        onReset={resetScanner}
      />

      <div className="flex flex-1 flex-col p-4">
        {/* QR 스캐너 뷰포트 */}
        <div className="relative mb-4 flex-1">
          <div className="relative h-full w-full overflow-hidden rounded-xl bg-black shadow-inner">
            {scannerState === 'scanning' ? (
              <Scanner
                onScan={(result) => {
                  if (result?.[0]?.rawValue) {
                    handleDetection(result[0].rawValue);
                  }
                }}
                constraints={constraints}
                formats={['qr_code']}
                components={{
                  torch: true, // 플래시 토글
                  zoom: false, // 줌은 복잡할 수 있어서 일단 비활성화
                  finder: true, // 스캔 가이드 표시
                }}
                styles={{
                  container: {
                    width: '100%',
                    height: '100%',
                  },
                  video: {
                    objectFit: 'cover',
                  },
                }}
              />
            ) : (
              <QRScannerOverlay state={scannerState} error={error} />
            )}
          </div>
        </div>

        <CameraSelector
          cameras={cameras}
          selectedCamera={selectedCamera}
          onCameraChange={handleCameraChange}
          disabled={scannerState === 'scanning'}
        />

        <QRUsageGuide />
      </div>

      {/* QR 결과 모달 */}
      {qrResult && <QRResultModal qrResult={qrResult} onClose={handleCloseResult} />}
    </div>
  );
};

// QR 스캐너 오버레이 (기존 ScannerViewport 참고)
const QRScannerOverlay = ({ state, error }: { state: 'idle' | 'success' | 'error'; error: string }) => {
  if (state === 'success') {
    return (
      <div className="absolute inset-0 z-10 bg-green-500/30 transition-all duration-300">
        <div className="flex h-full items-center justify-center">
          <div className="rounded-full bg-green-500 p-4 text-white">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-red-500/50 text-white">
        <div className="p-4 text-center">
          <div className="mb-2 text-4xl">⚠️</div>
          <div className="text-lg font-semibold">스캔 오류</div>
          <div className="mt-2 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
      <div className="text-center">
        <div className="mb-4 text-6xl">📱</div>
        <div className="text-lg font-semibold">QR 코드를 스캔하세요</div>
        <div className="mt-2 text-sm opacity-75">모든 QR 코드 지원</div>
      </div>
    </div>
  );
};

// QR 전용 사용 가이드
const QRUsageGuide = () => (
  <div className="mt-6 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
    <h3 className="mb-3 text-lg font-bold text-slate-800 dark:text-slate-100">💡 QR 스캔 가이드</h3>
    <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2 dark:text-slate-400">
      <div className="flex items-start">
        <span className="mr-2 text-blue-500">•</span>
        <span>QR 코드를 화면 중앙에 맞춰주세요</span>
      </div>
      <div className="flex items-start">
        <span className="mr-2 text-blue-500">•</span>
        <span>QR 코드와 10-30cm 거리 유지</span>
      </div>
      <div className="flex items-start">
        <span className="mr-2 text-blue-500">•</span>
        <span>충분한 조명 확보</span>
      </div>
      <div className="flex items-start">
        <span className="mr-2 text-blue-500">•</span>
        <span>모든 QR 코드 형식 지원</span>
      </div>
    </div>
  </div>
);
