import { useState, useEffect, useRef } from 'react';
import { ScanResultModal } from '@/components/ScanResultModal';

// 타입 정의
let Quagga: any = null;

interface CameraDevice {
  deviceId: string;
  label: string;
}

interface ScanResult {
  barcode: string;
  timestamp: Date;
}

export const ScannerPage = () => {
  // 스캔 상태 관리
  const [scannerState, setScannerState] = useState<'idle' | 'loading' | 'scanning' | 'success' | 'error'>('idle');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState('');

  // 카메라 관리
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [isLibraryLoading, setIsLibraryLoading] = useState(true);

  const scannerRef = useRef<HTMLDivElement>(null);
  const successTimer = useRef<number | null>(null);

  // ===== 최적화된 카메라 제약조건 =====
  const getOptimizedConstraints = (deviceId: string) => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      return {
        width: { ideal: 1280, min: 720 },
        height: { ideal: 720, min: 480 },
        frameRate: { ideal: 30, min: 20 },
        deviceId: { exact: deviceId },
        facingMode: { ideal: 'environment' },
      };
    } else {
      return {
        width: { ideal: 1920, min: 1280 },
        height: { ideal: 1080, min: 720 },
        frameRate: { ideal: 30, min: 15 },
        deviceId: { exact: deviceId },
        facingMode: { ideal: 'environment' },
      };
    }
  };

  // ===== 라이브러리 및 카메라 초기화 =====
  useEffect(() => {
    const initializeScanner = async () => {
      if (typeof window === 'undefined') return;

      try {
        // Quagga2 라이브러리 로드
        const QuaggaModule = await import('@ericblade/quagga2');
        Quagga = QuaggaModule.default;

        // 카메라 목록 로드
        await loadCameras();

        setScannerState('idle');
      } catch (err) {
        console.error('스캐너 초기화 실패:', err);
        setError('바코드 스캐너 라이브러리를 로드할 수 없습니다.');
        setScannerState('error');
      } finally {
        setIsLibraryLoading(false);
      }
    };

    initializeScanner();

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current);
      stopScanning();
    };
  }, []);

  // ===== 카메라 목록 로드 =====
  const loadCameras = async () => {
    try {
      // 카메라 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());

      // 카메라 장치 목록 가져오기
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter((device) => device.kind === 'videoinput')
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `카메라 ${index + 1}`,
        }));

      setCameras(videoDevices);

      if (videoDevices.length > 0) {
        // 후면 카메라 우선 선택
        const backCamera =
          videoDevices.find(
            (camera) =>
              camera.label.toLowerCase().includes('back') ||
              camera.label.toLowerCase().includes('rear') ||
              camera.label.toLowerCase().includes('environment') ||
              camera.label.toLowerCase().includes('후면'),
          ) || videoDevices[0];

        setSelectedCamera(backCamera.deviceId);
      }
    } catch (err) {
      console.error('카메라 로드 실패:', err);
      setError('카메라 접근 권한이 필요합니다. 브라우저 설정에서 카메라 권한을 허용해주세요.');
      setScannerState('error');
    }
  };

  // ===== 스캔 시작 =====
  const startScanning = () => {
    if (!Quagga || !scannerRef.current || !selectedCamera) {
      setError('스캐너가 준비되지 않았습니다.');
      return;
    }

    setError('');
    setScanResult(null);
    setScannerState('scanning');

    Quagga.init(
      {
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: scannerRef.current,
          constraints: getOptimizedConstraints(selectedCamera),
          area: {
            top: '25%',
            right: '15%',
            left: '15%',
            bottom: '25%',
          },
        },
        locator: {
          patchSize: 'large',
          halfSample: false,
        },
        decoder: {
          readers: ['code_128_reader'], // CODE128 전용
        },
        locate: true,
        frequency: 25, // 스캔 속도 최적화
      },
      (err: Error) => {
        if (err) {
          console.error('Quagga 초기화 실패:', err);
          setError('카메라 시작에 실패했습니다. 다른 카메라를 선택하거나 페이지를 새로고침해주세요.');
          setScannerState('error');
          return;
        }
        Quagga.start();
      },
    );

    Quagga.onDetected(handleDetection);
  };

  // ===== 스캔 중지 =====
  const stopScanning = () => {
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
  };

  // ===== 바코드 감지 처리 =====
  const handleDetection = async (result: any) => {
    if (result?.codeResult?.code) {
      const detectedBarcode = result.codeResult.code;

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

      // 8초 후 자동으로 idle 상태로 복귀 (모달이 열려있지 않은 경우)
      successTimer.current = setTimeout(() => {
        if (scannerState === 'success') {
          setScannerState('idle');
        }
      }, 8000);
    }
  };

  // ===== 카메라 변경 =====
  const handleCameraChange = (deviceId: string) => {
    stopScanning();
    setSelectedCamera(deviceId);

    // 카메라 변경 후 잠시 대기 후 재시작
    setTimeout(() => {
      if (scannerState === 'scanning') {
        startScanning();
      }
    }, 100);
  };

  // ===== 모달 관련 =====
  const handleCloseScanModal = () => {
    setScanResult(null);
    setScannerState('idle');

    // 모달 닫힌 후 300ms 뒤 카메라 재시작
    setTimeout(() => {
      startScanning();
    }, 300);
  };

  // ===== 초기화 =====
  const handleReset = () => {
    stopScanning();
    setScanResult(null);
    setError('');
    setScannerState('idle');
  };

  // ===== 로딩 상태 =====
  if (isLibraryLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <div className="text-indigo-600 dark:text-indigo-400">바코드 스캐너 로딩 중...</div>
          <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">카메라 권한을 허용해주세요</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* 컨트롤 버튼들 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          onClick={scannerState === 'scanning' ? stopScanning : startScanning}
          disabled={scannerState === 'success' || scannerState === 'loading' || !selectedCamera}
          className={`flex items-center justify-center gap-3 rounded-xl px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 focus:ring-4 focus:outline-none ${
            scannerState === 'scanning'
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-300'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300'
          } disabled:cursor-not-allowed disabled:bg-slate-400 disabled:hover:scale-100 dark:disabled:bg-slate-600`}
        >
          {scannerState === 'scanning' ? <>스캔 중지</> : <>스캔 시작</>}
        </button>

        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-3 rounded-xl bg-slate-200 px-6 py-4 text-lg font-semibold text-slate-700 shadow-lg transition-all hover:scale-105 hover:bg-slate-300 focus:ring-4 focus:ring-slate-300 focus:outline-none dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:focus:ring-slate-500"
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

      {/* 스캔 영역 */}
      <div className="flex flex-1 flex-col p-4">
        {/* 카메라 뷰포트 */}
        <div className="relative mb-4 flex-1">
          <div
            ref={scannerRef}
            className="relative h-full w-full overflow-hidden rounded-xl bg-black shadow-inner [&>canvas]:absolute [&>canvas]:inset-0 [&>video]:h-full [&>video]:w-full [&>video]:object-cover"
          >
            {/* 스캔 가이드 오버레이 */}
            {scannerState === 'scanning' && (
              <div className="pointer-events-none absolute inset-0 z-10">
                {/* 스캔 영역 가이드 */}
                <div className="absolute top-[25%] right-[15%] bottom-[25%] left-[15%] rounded-lg border-2 border-green-400/70">
                  <div className="absolute top-0 left-0 h-6 w-6 border-t-4 border-l-4 border-green-400"></div>
                  <div className="absolute top-0 right-0 h-6 w-6 border-t-4 border-r-4 border-green-400"></div>
                  <div className="absolute bottom-0 left-0 h-6 w-6 border-b-4 border-l-4 border-green-400"></div>
                  <div className="absolute right-0 bottom-0 h-6 w-6 border-r-4 border-b-4 border-green-400"></div>
                </div>

                {/* 스캔 라인 애니메이션 */}
                <div className="absolute top-[25%] right-[15%] bottom-[25%] left-[15%] overflow-hidden rounded-lg">
                  <div className="absolute inset-x-0 top-0 h-0.5 animate-pulse bg-green-400"></div>
                  <div className="absolute inset-x-0 h-0.5 bg-green-400/80"></div>
                </div>
              </div>
            )}

            {/* 성공 오버레이 */}
            {scannerState === 'success' && (
              <div className="absolute inset-0 z-10 bg-green-500/30 transition-all duration-300">
                <div className="flex h-full items-center justify-center">
                  <div className="rounded-full bg-green-500 p-4 text-white">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* 대기 상태 */}
            {scannerState === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                <div className="text-center">
                  <div className="mb-4 text-6xl">📷</div>
                  <div className="text-lg font-semibold">바코드를 스캔하세요</div>
                  <div className="mt-2 text-sm opacity-75">CODE128 바코드 지원</div>
                </div>
              </div>
            )}

            {/* 에러 상태 */}
            {scannerState === 'error' && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-500/50 text-white">
                <div className="p-4 text-center">
                  <div className="mb-2 text-4xl">⚠️</div>
                  <div className="text-lg font-semibold">스캔 오류</div>
                  <div className="mt-2 text-sm">{error}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 카메라 선택 (2개 이상일 때만 표시) */}
        {cameras.length > 1 && (
          <div className="mb-4">
            <select
              value={selectedCamera}
              onChange={(e) => handleCameraChange(e.target.value)}
              disabled={scannerState === 'scanning'}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            >
              {cameras.map((camera) => (
                <option key={camera.deviceId} value={camera.deviceId}>
                  {camera.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 사용 가이드 */}
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
      </div>

      {/* 스캔 결과 모달 */}
      {scanResult && <ScanResultModal scanResult={scanResult} onClose={handleCloseScanModal} />}
    </div>
  );
};
