import { useState, useEffect, useRef } from 'react';
import { CameraIcon, ScanIcon, StopIcon } from './components/icons';

// 타입 정의
let Quagga: any = null;

interface CameraDevice {
  deviceId: string;
  label: string;
}

interface ProductInfo {
  id: string;
  name: string;
  price: number;
  formattedPrice: string;
  category: string;
  stock: number;
  description: string;
  manufacturer: string;
  scannedAt?: string;
}

export default function App() {
  const [scannerState, setScannerState] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [scannedCode, setScannedCode] = useState('');
  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
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
        width: { ideal: 1280, min: 720 }, // 🔄 1920 → 1280
        height: { ideal: 720, min: 480 }, // 🔄 1080 → 720
        frameRate: { ideal: 30, min: 20 }, // 🔄 min 15 → 20
        deviceId: { exact: deviceId },
        facingMode: { ideal: 'environment' }, // 🆕 후면 카메라 우선
      };
    } else {
      // 💻 데스크톱: 기존 설정 유지
      return {
        width: { ideal: 1920, min: 1280 },
        height: { ideal: 1080, min: 720 },
        frameRate: { ideal: 30, min: 15 },
        deviceId: { exact: deviceId },
        facingMode: { ideal: 'environment' }, // 🆕 추가
      };
    }
  };

  // 제품 정보 조회 함수
  const fetchProductInfo = async (barcode: string) => {
    setIsLoadingProduct(true);
    setProductInfo(null);

    try {
      const response = await fetch(`/api/products/${barcode}`);
      const result = await response.json();

      if (result.success) {
        setProductInfo(result.data);
        setError('');
      } else {
        setError(`제품 조회 실패: ${result.error}`);
        setScannerState('error');
      }
    } catch (err) {
      console.error('API 호출 오류:', err);
      setError('서버와의 통신 중 오류가 발생했습니다.');
      setScannerState('error');
    } finally {
      setIsLoadingProduct(false);
    }
  };

  // 재고 관리 함수
  const updateStock = async (barcode: string, action: 'increase_stock' | 'decrease_stock', quantity: number) => {
    try {
      const response = await fetch(`/api/products/${barcode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, quantity }),
      });

      const result = await response.json();

      if (result.success) {
        setProductInfo(result.data);
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('재고 업데이트 오류:', err);
      return { success: false, error: '재고 업데이트 중 오류가 발생했습니다.' };
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
        .map((device, i) => ({ deviceId: device.deviceId, label: device.label || `카메라 ${i + 1}` }));

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
    setProductInfo(null);
    setScannerState('scanning');

    Quagga.init(
      {
        inputStream: {
          name: 'Live',
          type: 'LiveStream',
          target: scannerRef.current,
          constraints: getOptimizedConstraints(selectedCamera), // 최적화된 설정 적용!
          // 스캔 영역을 중앙으로 제한 (선택사항)
          area: {
            top: '25%',
            right: '15%',
            left: '15%',
            bottom: '25%',
          },
        },
        locator: {
          patchSize: 'large', // medium → large (CODE39 최적화)
          halfSample: false, // true → false (정확도 향상)
        },
        decoder: { readers: ['code_39_reader'] },
        locate: true,
        frequency: 25, // 10 → 25 (2.5배 빨라짐!)
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

  // TODO: 스캐너 중지 함수 안된다 나중에 카메라 스트림이 해제되지 않는 문제 해결
  const stopScanning = () => {
    if (Quagga?.initialized) {
      Quagga.offDetected(handleDetection);
      Quagga.stop();

      const sd = Quagga.CameraAccess.getState();
      console.log('카메라 상태:', sd);

      // 🚨 카메라 스트림 완전 해제
      try {
        // 방법 1: Quagga2 CameraAccess API
        if (Quagga.CameraAccess?.release) {
          Quagga.CameraAccess.release();
        }

        // 방법 2: 직접 MediaStream 해제 (백업)
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

      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      stopScanning();

      await fetchProductInfo(code);

      successTimer.current = setTimeout(() => {
        if (scannerState === 'success') {
          setScannerState('idle');
        }
      }, 8000);
    }
  };

  const handleCameraChange = (deviceId: string) => {
    stopScanning();
    setSelectedCamera(deviceId);
    setTimeout(startScanning, 100);
  };

  const handleReset = () => {
    setScannedCode('');
    setProductInfo(null);
    setError('');
    setScannerState('idle');
  };

  // 재고 관리 핸들러
  const handleStockUpdate = async (action: 'increase_stock' | 'decrease_stock', quantity: number) => {
    if (!productInfo) return;

    const result = await updateStock(productInfo.id, action, quantity);
    if (result.success) {
      alert(result.message);
    } else {
      alert(`오류: ${result.error}`);
    }
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
      <div className="mx-auto max-w-6xl">
        {/* 헤더 */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-indigo-600 sm:text-4xl dark:text-indigo-400">CODE39 바코드 스캐너</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">실시간 제품 정보 조회 & 재고 관리</p>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* 스캐너 영역 */}
          <div className="flex flex-col space-y-4 rounded-2xl bg-white p-4 shadow-lg dark:bg-slate-800/50">
            <div
              ref={scannerRef}
              className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-inner [&>video]:h-full [&>video]:w-full [&>video]:object-cover"
            >
              {/* 🆕 스캔 영역 가이드 (선택사항) */}
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
                    <p className="font-semibold text-green-800 dark:text-green-300">✅ 스캔 성공</p>
                    <p className="mt-1 font-mono text-lg font-bold break-all text-slate-800 dark:text-slate-100">
                      {scannedCode}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setScannedCode('');
                      setProductInfo(null);
                    }}
                    className="text-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    &times;
                  </button>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(scannedCode)}
                  className="mt-2 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  바코드 복사
                </button>
              </div>
            )}

            {/* 제품 정보 로딩 */}
            {isLoadingProduct && (
              <div className="rounded-r-lg border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-blue-900/30">
                <p className="text-blue-800 dark:text-blue-300">🔍 제품 정보를 조회하고 있습니다...</p>
              </div>
            )}

            {/* 제품 정보 */}
            {productInfo && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{productInfo.name}</h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      productInfo.stock > 10
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : productInfo.stock > 0
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}
                  >
                    재고: {productInfo.stock}개
                  </span>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">가격</p>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {productInfo.formattedPrice}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">카테고리</p>
                    <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">{productInfo.category}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">제조사</p>
                  <p className="text-base font-medium text-slate-700 dark:text-slate-300">{productInfo.manufacturer}</p>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-slate-600 dark:text-slate-400">제품 설명</p>
                  <p className="text-base text-slate-700 dark:text-slate-300">{productInfo.description}</p>
                </div>

                {/* 재고 관리 버튼 */}
                <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
                  <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">📦 재고 관리</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleStockUpdate('decrease_stock', 1)}
                      disabled={productInfo.stock === 0}
                      className="flex items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
                    >
                      ➖ 출고 (-1)
                    </button>
                    <button
                      onClick={() => handleStockUpdate('increase_stock', 1)}
                      className="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-medium text-white transition-colors hover:bg-green-600"
                    >
                      ➕ 입고 (+1)
                    </button>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleStockUpdate('decrease_stock', 5)}
                      disabled={productInfo.stock < 5}
                      className="flex items-center justify-center gap-2 rounded-lg bg-red-400 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-200"
                    >
                      📦 대량출고 (-5)
                    </button>
                    <button
                      onClick={() => handleStockUpdate('increase_stock', 10)}
                      className="flex items-center justify-center gap-2 rounded-lg bg-green-400 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-500"
                    >
                      📦 대량입고 (+10)
                    </button>
                  </div>
                </div>

                {productInfo.scannedAt && (
                  <p className="mt-4 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-500">
                    조회 시간: {new Date(productInfo.scannedAt).toLocaleString('ko-KR')}
                  </p>
                )}
              </div>
            )}

            {/* 사용 가이드 */}
            <div className="rounded-2xl bg-white p-5 shadow-lg dark:bg-slate-800/50">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">💡 사용 가이드</h3>
              <ul className="mt-3 space-y-2 text-slate-600 dark:text-slate-400">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>바코드를 화면 중앙에 맞춰주세요.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>바코드와 10-20cm 거리를 유지하세요.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>스캔 후 자동으로 제품 정보가 조회됩니다.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>재고 관리 버튼으로 입출고를 관리할 수 있습니다.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>테스트 바코드: 123456789, 987654321, CODE39TEST</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
