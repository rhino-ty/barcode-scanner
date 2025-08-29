import { useState, useEffect, useRef } from 'react';
import { CameraIcon, ScanIcon, StopIcon } from './components/icons';

// 타입 정의
let Quagga: any = null;

interface CameraDevice {
  deviceId: string;
  label: string;
}

export default function App() {
  const [scannerState, setScannerState] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [scannedCode, setScannedCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const scannerRef = useRef<HTMLDivElement>(null);
  const successTimer = useRef<number | null>(null);

  // ===== 🚀 최적화된 카메라 제약조건 함수 =====
  const getOptimizedConstraints = (deviceId: string) => {
    // 모바일 기기 감지
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      // 📱 모바일 최적화: 해상도 낮추고 프레임레이트 높임
      return {
        width: { ideal: 1280, min: 720 },
        height: { ideal: 720, min: 480 },
        frameRate: { ideal: 30, min: 20 },
        deviceId: { exact: deviceId },
        facingMode: { ideal: 'environment' }, // 후면 카메라 우선
      };
    } else {
      // 💻 데스크톱: 기존 설정 유지
      return {
        width: { ideal: 1920, min: 1280 },
        height: { ideal: 1080, min: 720 },
        frameRate: { ideal: 30, min: 15 },
        deviceId: { exact: deviceId },
        facingMode: { ideal: 'environment' },
      };
    }
  };

  // 스캔 로그 저장 함수
  const saveScanLog = async (barcode: string, result: 'success' | 'failed', errorMessage?: string) => {
    try {
      const response = await fetch('/api/scan-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: 로그인 구현 후 Authorization 헤더 추가
        },
        body: JSON.stringify({
          scannedBarcode: barcode,
          scanResult: result,
          errorMessage,
          deviceInfo: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
        }),
      });

      if (!response.ok) {
        console.warn('스캔 로그 저장 실패:', response.status);
      }
    } catch (err) {
      console.warn('스캔 로그 저장 오류:', err);
      // 로그 저장 실패해도 사용자 경험 방해하지 않음
    }
  };

  // 라이프사이클 및 초기화
  useEffect(() => {
    const init = async () => {
      if (typeof window === 'undefined') return;
      try {
        const QuaggaModule = await import('@ericblade/quagga2');
        Quagga = QuaggaModule.default;
        await loadCameras();
      } catch (err) {
        console.error('초기화 실패:', err);
        setError('라이브러리 로드에 실패했습니다.');
        setScannerState('error');
      } finally {
        setIsLoading(false);
      }
    };
    init();

    return () => {
      if (successTimer.current) clearTimeout(successTimer.current);
      stopScanning();
    };
  }, []);

  // ===== 개선 카메라 로딩 함수 =====
  const loadCameras = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter((device) => device.kind === 'videoinput')
        .map((device, i) => ({
          deviceId: device.deviceId,
          label: device.label || `카메라 ${i + 1}`,
        }));

      setCameras(videoDevices);

      if (videoDevices.length > 0) {
        // 후면 카메라 더 정확하게 찾기
        const backCamera =
          videoDevices.find(
            (c) =>
              c.label.toLowerCase().includes('back') ||
              c.label.toLowerCase().includes('rear') ||
              c.label.toLowerCase().includes('environment') ||
              c.label.toLowerCase().includes('후면'),
          ) || videoDevices[0];

        setSelectedCamera(backCamera.deviceId);
      }
    } catch (err) {
      console.error('카메라 로드 실패:', err);
      setError('카메라 접근 권한이 필요합니다. 페이지를 새로고침하거나 권한을 허용해주세요.');
      setScannerState('error');
    }
  };

  // ===== 🚀 최적화된 스캐너 시작 함수 =====
  const startScanning = () => {
    if (!Quagga || !scannerRef.current || !selectedCamera) return;

    setError('');
    setScannedCode('');
    setScannerState('scanning');

    Quagga.init(
      {
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: scannerRef.current,
          constraints: getOptimizedConstraints(selectedCamera),
          // 스캔 영역을 중앙으로 제한
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
        decoder: { readers: ['code_128_reader'] },
        locate: true,
        frequency: 25,
      },
      (err: any) => {
        if (err) {
          console.error('Quagga 초기화 실패:', err);
          setError('카메라 시작에 실패했습니다. 다른 카메라를 선택하거나 새로고침 해보세요.');
          setScannerState('error');
          return;
        }
        Quagga.start();
      },
    );

    Quagga.onDetected(handleDetection);
  };

  // 스캐너 중지 함수
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

  const handleDetection = async (result: any) => {
    if (result?.codeResult?.code) {
      const code = result.codeResult.code;
      setScannedCode(code);
      setScannerState('success');

      // 햅틱 피드백
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

      stopScanning();

      // 클립보드에 자동 복사
      try {
        await navigator.clipboard.writeText(code);
        console.log('바코드가 클립보드에 복사되었습니다:', code);
      } catch (err) {
        console.warn('클립보드 복사 실패:', err);
      }

      // 스캔 로그 저장
      await saveScanLog(code, 'success');

      // 3초 후 자동으로 idle 상태로 변경
      successTimer.current = setTimeout(() => {
        setScannerState('idle');
        setScannedCode('');
      }, 3000);
    }
  };

  const handleCameraChange = (deviceId: string) => {
    stopScanning();
    setSelectedCamera(deviceId);
    setTimeout(startScanning, 100);
  };

  const handleReset = () => {
    if (successTimer.current) {
      clearTimeout(successTimer.current);
      successTimer.current = null;
    }
    setScannedCode('');
    setError('');
    setScannerState('idle');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <ScanIcon className="mx-auto h-16 w-16 animate-pulse text-indigo-500 dark:text-indigo-400" />
          <h1 className="mt-4 text-2xl font-bold text-indigo-600 dark:text-indigo-400">스캐너 로딩 중...</h1>
          <p className="text-slate-500 dark:text-slate-400">최적화된 카메라 설정을 적용하고 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 text-slate-800 dark:bg-slate-900 dark:text-slate-200">
      <div className="mx-auto max-w-4xl">
        {/* 헤더 */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-indigo-600 sm:text-4xl dark:text-indigo-400">CODE128 바코드 스캐너</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">바코드 스캔 후 자동으로 클립보드에 복사됩니다</p>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* 스캐너 영역 */}
          <div className="flex flex-col space-y-4 rounded-2xl bg-white p-4 shadow-lg dark:bg-slate-800/50">
            <div
              ref={scannerRef}
              className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-inner [&>video]:h-full [&>video]:w-full [&>video]:object-cover"
            >
              {/* 스캔 영역 가이드 */}
              {scannerState === 'scanning' && (
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute top-[25%] right-[15%] bottom-[25%] left-[15%] rounded-lg border-2 border-green-400/50">
                    <div className="absolute top-0 left-0 h-4 w-4 border-t-2 border-l-2 border-green-400"></div>
                    <div className="absolute top-0 right-0 h-4 w-4 border-t-2 border-r-2 border-green-400"></div>
                    <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-green-400"></div>
                    <div className="absolute right-0 bottom-0 h-4 w-4 border-r-2 border-b-2 border-green-400"></div>
                  </div>
                </div>
              )}

              <div
                className={`absolute inset-0 transition-all duration-300 ${
                  scannerState === 'success' ? 'bg-green-500/30' : ''
                }`}
              />

              {scannerState === 'idle' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                  <p className="text-lg font-semibold">카메라 준비 완료</p>
                </div>
              )}

              {scannerState === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-500/50 text-white">
                  <p className="p-4 text-center text-lg font-semibold">{error}</p>
                </div>
              )}
            </div>

            {/* 카메라 선택 */}
            {cameras.length >= 1 && (
              <div className="relative">
                <select
                  value={selectedCamera}
                  onChange={(e) => handleCameraChange(e.target.value)}
                  disabled={scannerState === 'scanning'}
                  className="w-full appearance-none rounded-lg border border-slate-300 bg-slate-100 py-2.5 pr-4 pl-10 text-base focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700"
                >
                  {cameras.map((cam) => (
                    <option key={cam.deviceId} value={cam.deviceId}>
                      {cam.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <CameraIcon className="h-5 w-5 text-slate-400" />
                </div>
              </div>
            )}
          </div>

          {/* 컨트롤 및 결과 영역 */}
          <div className="flex flex-col space-y-6">
            {/* 버튼들 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                onClick={scannerState === 'scanning' ? stopScanning : startScanning}
                disabled={scannerState === 'success'}
                className={`flex w-full transform items-center justify-center gap-2 rounded-lg px-6 py-4 text-lg font-bold text-white shadow-md transition-transform hover:scale-105 focus:ring-4 focus:outline-none ${
                  scannerState === 'scanning'
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-300'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300'
                } disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-600`}
              >
                {scannerState === 'scanning' ? <StopIcon className="h-6 w-6" /> : <ScanIcon className="h-6 w-6" />}
                {scannerState === 'scanning' ? '스캔 중지' : '스캔 시작'}
              </button>
              <button
                onClick={handleReset}
                className="flex w-full transform items-center justify-center gap-2 rounded-lg bg-slate-200 px-6 py-4 text-lg font-semibold text-slate-700 shadow-md transition-transform hover:scale-105 hover:bg-slate-300 focus:ring-4 focus:ring-slate-300 focus:outline-none dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 dark:focus:ring-slate-500"
              >
                초기화
              </button>
            </div>

            {/* 스캔 결과 */}
            {scannedCode && (
              <div className="rounded-r-lg border-l-4 border-green-500 bg-green-50 p-4 shadow-sm dark:bg-green-900/30">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-300">✅ 스캔 성공 (자동 복사됨)</p>
                    <p className="mt-1 font-mono text-lg font-bold break-all text-slate-800 dark:text-slate-100">
                      {scannedCode}
                    </p>
                  </div>
                  <button
                    onClick={() => setScannedCode('')}
                    className="text-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    &times;
                  </button>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(scannedCode)}
                  className="mt-2 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  다시 복사
                </button>
              </div>
            )}

            {/* 사용 가이드 */}
            <div className="rounded-2xl bg-white p-5 shadow-lg dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">💡 사용 가이드</h3>
              <ul className="mt-3 space-y-2 text-slate-600 dark:text-slate-400">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>바코드를 화면 중앙의 네모 영역에 맞춰주세요.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>바코드와 10-20cm 거리를 유지하세요.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>스캔 성공 시 자동으로 클립보드에 복사됩니다.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>스캔 이력은 자동으로 시스템에 기록됩니다.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>테스트 바코드: 123456789, 987654321, CODE39TEST</span>
                </li>
              </ul>
            </div>

            {/* 에러 표시 */}
            {error && scannerState === 'error' && (
              <div className="rounded-r-lg border-l-4 border-red-500 bg-red-50 p-4 shadow-sm dark:bg-red-900/30">
                <p className="font-semibold text-red-800 dark:text-red-300">❌ 오류 발생</p>
                <p className="mt-1 text-red-700 dark:text-red-400">{error}</p>
                <button
                  onClick={() => {
                    setError('');
                    setScannerState('idle');
                  }}
                  className="mt-2 text-sm font-semibold text-red-600 hover:underline dark:text-red-400"
                >
                  다시 시도
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
