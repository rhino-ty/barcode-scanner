import { useState, useRef, useCallback } from 'react';
import {
  getOptimizedConstraints,
  getOptimizedFrequency,
  getOptimalWorkerCount,
  getScanArea,
} from '@/utils/scanner/scannerConfig';

interface ScanResult {
  barcode: string;
  timestamp: Date;
}

type ScannerState = 'idle' | 'loading' | 'scanning' | 'success' | 'error';

interface UseBarcodeScannerProps {
  selectedCamera: string;
}

interface UseBarcodeScannerReturn {
  scannerState: ScannerState;
  scanResult: ScanResult | null;
  error: string;
  startScanning: () => void;
  stopScanning: () => void;
  resetScanner: () => void;
  scannerRef: React.RefObject<HTMLDivElement | null>;
}

// eslint-disable-next-line prefer-const
let Quagga: any = null;

export const useBarcodeScanner = ({ selectedCamera }: UseBarcodeScannerProps): UseBarcodeScannerReturn => {
  const [scannerState, setScannerState] = useState<ScannerState>('idle');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');

  const scannerRef = useRef<HTMLDivElement>(null);
  const successTimer = useRef<number | null>(null);
  const consecutiveFailures = useRef(0);

  /**
   * 바코드 감지 핸들러
   * @param result Quagga가 감지한 결과 객체
   * - 바코드가 감지되면 scanResult 상태 업데이트 및 성공 상태로 전환
   * - 너무 짧은 바코드는 무시 (3자 미만)
   * - 연속 실패가 10회 이상일 경우 스캐너를 재시작하여 안정성 향상
   * - 진동 피드백 제공 (지원되는 경우)
   */
  const handleDetection = useCallback(
    (result: any) => {
      if (result?.codeResult?.code) {
        const detectedBarcode = result.codeResult.code;

        if (detectedBarcode.length < 3) {
          console.warn('너무 짧은 바코드 무시:', detectedBarcode);
          return;
        }

        consecutiveFailures.current = 0;

        // 성공 상태로 전환
        setScanResult({
          barcode: detectedBarcode,
          timestamp: new Date(),
        });
        setScannerState('success');

        // 햅틱 피드백
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }

        // 스캔 중지
        stopScanning();

        // 8초 후에 자동으로 idle 상태로 복귀
        successTimer.current = setTimeout(() => {
          setScannerState('idle');
        }, 8000);
      } else {
        // 연속 실패가 10회 이상일 경우 스캐너를 재시작
        consecutiveFailures.current++;

        if (consecutiveFailures.current >= 10) {
          console.log('연속 실패로 인한 스캐너 재시작');
          stopScanning();
          setTimeout(() => {
            if (scannerState === 'scanning') {
              startScanning();
            }
          }, 1000);
          consecutiveFailures.current = 0;
        }
      }
    },
    [scannerState],
  );

  /**
   * 스캐너 시작
   * - Quagga 초기화 및 시작
   * - 선택된 카메라와 디바이스 성능에 최적화된 설정 사용
   * - 감지 핸들러 등록
   * - 오류 발생 시 에러 상태로 전환 및 메시지 설정
   */
  const startScanning = useCallback(() => {
    if (!Quagga || !scannerRef.current || !selectedCamera) {
      setError('스캐너가 준비되지 않았습니다.');
      return;
    }

    setError('');
    setScanResult(null);
    setScannerState('scanning');
    consecutiveFailures.current = 0;

    // Quagga 설정
    const config = {
      inputStream: {
        name: 'Live',
        type: 'LiveStream',
        target: scannerRef.current,
        constraints: getOptimizedConstraints(selectedCamera),
        area: getScanArea(),
      },
      locator: {
        patchSize: 'large',
        halfSample: false,
        debug: {
          showCanvas: false,
          showPatches: false,
          showFoundPatches: false,
          showSkeleton: false,
          showLabels: false,
          showPatchLabels: false,
          showRemainingPatchLabels: false,
          boxFromPatches: {
            showTransformed: false,
            showTransformedBox: false,
            showBB: false,
          },
        },
      },
      decoder: {
        readers: [
          'code_128_reader',
          {
            format: 'code_128_reader', // CODE128 전용
            config: {
              // CODE128 디코더 최적화
              normalizeBarSpaceWidth: true, // 바 간격 정규화
              threshold: 160, // 임계값 조정 (기본: 160)
              minBarSpacing: 1, // 최소 바 간격
              maxBarSpacing: 3, // 최대 바 간격
            },
          },
        ],
        multiple: false,
      },
      locate: true,
      frequency: getOptimizedFrequency(),
      numOfWorkers: getOptimalWorkerCount(),
      debug: import.meta.env.DEV,
    };

    Quagga.init(config, (err: Error) => {
      if (err) {
        console.error('Quagga 초기화 실패:', err);
        setError('카메라 시작에 실패했습니다. 다른 카메라를 선택하거나 페이지를 새로고침해주세요.');
        setScannerState('error');
        return;
      }

      setTimeout(() => {
        Quagga.start();
      }, 500);
    });

    Quagga.onDetected(handleDetection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCamera]);

  /**
   * 스캐너 중지
   * - Quagga 중지 및 감지 핸들러 해제
   * - 카메라 스트림 해제
   * - 스캐너 상태를 idle로 전환
   * - 오류 발생 시 콘솔에 로그 남김
   */
  const stopScanning = useCallback(() => {
    if (Quagga?.initialized) {
      Quagga.offDetected(handleDetection);
      Quagga.stop();

      // 카메라 스트림 완전 해제
      try {
        if (Quagga.CameraAccess?.release) {
          Quagga.CameraAccess.release();
        }

        const video = scannerRef.current?.querySelector('video');
        if (video?.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
          video.srcObject = null;
        }
      } catch (error) {
        console.error('카메라 해제 실패:', error);
      }
    }

    if (scannerState === 'scanning') {
      setScannerState('idle');
    }
  }, [handleDetection, scannerState]);

  /**
   * 스캐너 초기화
   * - 스캐너 중지
   * - 스캔 결과 및 에러 상태 초기화
   * - 스캐너 상태를 idle로 전환
   * - 성공 타이머 해제
   */
  const resetScanner = useCallback(() => {
    stopScanning();
    setScanResult(null);
    setError('');
    setScannerState('idle');
    if (successTimer.current) {
      clearTimeout(successTimer.current);
    }
  }, [stopScanning]);

  return {
    scannerState,
    scanResult,
    error,
    startScanning,
    stopScanning,
    resetScanner,
    scannerRef,
  };
};
