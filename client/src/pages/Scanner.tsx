import { useQuaggaLoad } from '@/hooks/scanner/useQuaggaLoad';
import { useCamera } from '@/hooks/scanner/useCamera';
import { useBarcodeScanner } from '@/hooks/scanner/useBarcodeScanner';
import { ScannerControls } from '@/components/scanner/ScannerControls';
import { CameraSelector } from '@/components/scanner/CameraSelector';
import { ScannerViewport } from '@/components/scanner/ScannerViewport';
import { ScannerUsageGuide } from '@/components/scanner/ScannerUsageGuide';
import { ScanResultModal } from '@/components/ScanResultModal';
import { PageLoader } from '@/components/Loading';

export const ScannerPage = () => {
  const { isLibraryLoading, loadError } = useQuaggaLoad();
  const { cameras, selectedCamera, setSelectedCamera } = useCamera();
  const { scannerState, scanResult, error, startScanning, stopScanning, resetScanner, scannerRef } = useBarcodeScanner({
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

  const handleCloseScanModal = () => {
    resetScanner();
    setTimeout(() => {
      startScanning();
    }, 300);
  };

  if (isLibraryLoading) {
    return <PageLoader />;
  }

  if (loadError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <div className="text-lg font-semibold text-red-600">{loadError}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ScannerControls
        scannerState={scannerState}
        selectedCamera={selectedCamera}
        onStartStop={handleStartStop}
        onReset={resetScanner}
      />

      <div className="flex flex-1 flex-col p-4">
        <ScannerViewport scannerState={scannerState} error={error} scannerRef={scannerRef} />

        <CameraSelector
          cameras={cameras}
          selectedCamera={selectedCamera}
          onCameraChange={handleCameraChange}
          disabled={scannerState === 'scanning'}
        />

        <ScannerUsageGuide />
      </div>

      {/* 스캔 결과 모달 */}
      {scanResult && <ScanResultModal scanResult={scanResult} onClose={handleCloseScanModal} />}
    </div>
  );
};
