import { useState, useCallback, useRef } from 'react';

interface QRResult {
  data: string;
  timestamp: Date;
  type: 'ship_url' | 'product_code' | 'other';
}

type ScannerState = 'idle' | 'scanning' | 'success' | 'error';

interface UseQRScannerProps {
  selectedCamera: string;
}

interface UseQRScannerReturn {
  scannerState: ScannerState;
  qrResult: QRResult | null;
  error: string;
  startScanning: () => void;
  stopScanning: () => void;
  resetScanner: () => void;
  handleDetection: (data: string) => void;
}

export const useQRScanner = ({ selectedCamera }: UseQRScannerProps): UseQRScannerReturn => {
  const [scannerState, setScannerState] = useState<ScannerState>('idle');
  const [qrResult, setQrResult] = useState<QRResult | null>(null);
  const [error, setError] = useState('');

  const successTimer = useRef<number | null>(null);

  /**
   * QR 데이터 타입 분석
   * ship.arneg.co.kr URL vs 순수 품번 구분
   */
  const analyzeQRData = useCallback((data: string): QRResult['type'] => {
    if (data.includes('ship.arneg.co.kr')) {
      return 'ship_url';
    }

    // 품번 패턴 확인 (알파벳+숫자 조합 등)
    if (/^[A-Z0-9]{6,20}$/.test(data.trim())) {
      return 'product_code';
    }

    return 'other';
  }, []);

  /**
   * QR 감지 핸들러 - S/N 추출 로직 포함
   */
  const handleQRDetection = useCallback(
    (data: string) => {
      if (!data || data.length < 3) {
        console.warn('너무 짧은 QR 데이터 무시:', data);
        return;
      }

      const qrType = analyzeQRData(data);

      console.log('QR 스캔 결과:', {
        원본데이터: data,
        타입: qrType,
      });

      setQrResult({
        data: data.trim(),
        timestamp: new Date(),
        type: qrType,
      });

      setScannerState('success');

      // 햅틱 피드백 (기존 로직 재사용)
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      // 8초 후 자동 리셋
      successTimer.current = setTimeout(() => {
        setScannerState('idle');
      }, 8000);
    },
    [analyzeQRData],
  );

  const startScanning = useCallback(() => {
    if (!selectedCamera) {
      setError('카메라가 선택되지 않았습니다.');
      return;
    }

    setError('');
    setQrResult(null);
    setScannerState('scanning');
  }, [selectedCamera]);

  const stopScanning = useCallback(() => {
    setScannerState('idle');
  }, []);

  const resetScanner = useCallback(() => {
    stopScanning();
    setQrResult(null);
    setError('');
    setScannerState('idle');

    if (successTimer.current) {
      clearTimeout(successTimer.current);
    }
  }, [stopScanning]);

  // QR 감지 함수를 외부에서 호출할 수 있도록 노출
  const handleDetection = handleQRDetection;

  return {
    scannerState,
    qrResult,
    error,
    startScanning,
    stopScanning,
    resetScanner,
    handleDetection, // Scanner 컴포넌트에서 사용
  };
};
