import React from 'react';
import { isMobile } from '@/utils/deviceDetection';

interface ScannerViewportProps {
  scannerState: 'idle' | 'loading' | 'scanning' | 'success' | 'error';
  error: string;
  scannerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * 스캐너 뷰포트 컴포넌트
 * @param param0 스캐너 상태, 에러 메시지, 스캐너 참조
 * @returns JSX.Element
 */
export const ScannerViewport: React.FC<ScannerViewportProps> = ({ scannerState, error, scannerRef }) => {
  const isMobileDevice = isMobile();

  return (
    <div className="relative mb-4 flex-1">
      <div
        ref={scannerRef}
        className="relative h-full w-full overflow-hidden rounded-xl bg-black shadow-inner [&>canvas]:absolute [&>canvas]:inset-0 [&>video]:h-full [&>video]:w-full [&>video]:object-cover"
      >
        {/* 스캔 가이드 오버레이 */}
        {scannerState === 'scanning' && <ScanGuideOverlay isMobile={isMobileDevice} />}

        {/* 성공 오버레이 */}
        {scannerState === 'success' && <SuccessOverlay />}

        {/* 대기 상태 */}
        {scannerState === 'idle' && <IdleOverlay />}

        {/* 에러 상태 */}
        {scannerState === 'error' && <ErrorOverlay error={error} />}
      </div>
    </div>
  );
};

// 서브 컴포넌트들
const ScanGuideOverlay: React.FC<{ isMobile: boolean }> = ({ isMobile }) => (
  <div className="pointer-events-none absolute inset-0 z-10">
    <div
      className={`absolute rounded-lg border-2 border-green-400/70 ${
        isMobile ? 'top-[20%] right-[10%] bottom-[20%] left-[10%]' : 'top-[25%] right-[15%] bottom-[25%] left-[15%]'
      }`}
    >
      <div className="absolute top-0 left-0 h-6 w-6 border-t-4 border-l-4 border-green-400"></div>
      <div className="absolute top-0 right-0 h-6 w-6 border-t-4 border-r-4 border-green-400"></div>
      <div className="absolute bottom-0 left-0 h-6 w-6 border-b-4 border-l-4 border-green-400"></div>
      <div className="absolute right-0 bottom-0 h-6 w-6 border-r-4 border-b-4 border-green-400"></div>
    </div>

    <div
      className={`absolute overflow-hidden rounded-lg ${
        isMobile ? 'top-[20%] right-[10%] bottom-[20%] left-[10%]' : 'top-[25%] right-[15%] bottom-[25%] left-[15%]'
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-0.5 animate-pulse bg-green-400"></div>
    </div>

    <div className="absolute right-4 bottom-4 left-4 text-center">
      <div className="rounded-lg bg-black/50 px-4 py-2 text-white backdrop-blur-sm">
        <div className="text-sm font-medium">바코드를 가이드 영역에 맞춰주세요</div>
        <div className="text-xs opacity-75">거리: 10-20cm 권장</div>
      </div>
    </div>
  </div>
);

const SuccessOverlay: React.FC = () => (
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

const IdleOverlay: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
    <div className="text-center">
      <div className="mb-4 text-6xl">📷</div>
      <div className="text-lg font-semibold">바코드를 스캔하세요</div>
      <div className="mt-2 text-sm opacity-75">CODE128 바코드 지원</div>
    </div>
  </div>
);

const ErrorOverlay: React.FC<{ error: string }> = ({ error }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-red-500/50 text-white">
    <div className="p-4 text-center">
      <div className="mb-2 text-4xl">⚠️</div>
      <div className="text-lg font-semibold">스캔 오류</div>
      <div className="mt-2 text-sm">{error}</div>
    </div>
  </div>
);
