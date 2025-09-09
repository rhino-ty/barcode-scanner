import { getDeviceInfo, getPerformanceTier } from '@/utils/deviceDetection';

/**
 * 카메라 디바이스에 최적화된 제약 조건 반환,
 * quagga2에서 inputStream의 constraints 객체에 사용
 * @param deviceId 카메라 디바이스 ID
 * @returns 최적화된 제약 조건 객체
 */
export const getOptimizedConstraints = (deviceId: string) => {
  const { isMobile, isTablet, isLowEnd } = getDeviceInfo();

  const baseConstraints = {
    deviceId: { exact: deviceId },
    facingMode: { ideal: 'environment' },
    focusMode: { ideal: 'continuous' }, // 자동 초점
    exposureMode: { ideal: 'continuous' }, // 자동 노출
    whiteBalanceMode: { ideal: 'continuous' }, // 자동 화이트밸런스
  };

  if (isTablet) {
    // 태블릿: 높은 해상도로 정확도 우선
    return {
      ...baseConstraints,
      width: { ideal: 1920, min: 1280 },
      height: { ideal: 1080, min: 720 },
      frameRate: { ideal: 30, min: 15 },
    };
  } else if (isMobile) {
    // 모바일: 안정성과 성능 균형
    return {
      ...baseConstraints,
      width: { ideal: isLowEnd ? 720 : 1280, min: 480 },
      height: { ideal: isLowEnd ? 480 : 720, min: 320 },
      frameRate: { ideal: 30, min: 20 },
    };
  } else {
    return {
      ...baseConstraints,
      width: { ideal: 1920, min: 1280 },
      height: { ideal: 1080, min: 720 },
      frameRate: { ideal: 30, min: 15 },
    };
  }
};

/**
 *
 * 디바이스 성능에 맞게 스캔 빈도를 최적화
 * @returns 초당 권장 스캔 빈도
 * - 모바일 저사양: 6fps
 * - 모바일 중간: 8fps
 * - 모바일 고사양: 12fps
 * - 데스크탑: 저사양 15fps, 중간/고사양 20fps
 */
export const getOptimizedFrequency = (): number => {
  const tier = getPerformanceTier();
  const { isMobile } = getDeviceInfo();

  if (isMobile) {
    switch (tier) {
      case 'low':
        return 6;
      case 'mid':
        return 8;
      case 'high':
        return 12;
    }
  }

  return tier === 'high' ? 20 : 15;
};

/**
 *
 * 디바이스 성능에 따라 최적의 웹 워커 수 결정
 * @returns 최적의 웹 워커 수
 * - 모바일: 코어 6 이상 및 메모리 4GB 이상인 경우 2, 그렇지 않으면 1
 * - 데스크탑: 코어 4 초과인 경우 2, 그렇지 않으면 1
 */
export const getOptimalWorkerCount = (): number => {
  const { isMobile, cores } = getDeviceInfo();
  const memory = (navigator as any).deviceMemory || 4;

  if (isMobile) {
    return cores >= 6 && memory >= 4 ? 2 : 1;
  }

  return cores > 4 ? 2 : 1;
};

export const getScanArea = () => {
  const { isMobile } = getDeviceInfo();

  return isMobile
    ? {
        top: '20%',
        right: '10%',
        left: '10%',
        bottom: '20%',
      }
    : {
        top: '25%',
        right: '15%',
        left: '15%',
        bottom: '25%',
      };
};
