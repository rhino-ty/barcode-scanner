export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isLowEnd: boolean;
  cores: number;
  memory: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  platform: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown';
}

let cachedDeviceInfo: DeviceInfo | null = null;

/**
 * 디바이스 정보를 한 번에 가져오는 순수 함수
 * 브라우저 정보가 변경되지 않으므로 캐싱 가능
 *
 * @return DeviceInfo 객체
 * - isMobile: 모바일 기기 여부
 * - isTablet: 태블릿 기기 여부
 * - isLowEnd: 저사양 기기 여부 (코어 수 2 이하 또는 메모리 3GB 미만)
 * - cores: CPU 코어 수
 * - memory: 기기 메모리 (GB 단위)
 * - deviceType: 'mobile' | 'tablet' | 'desktop'
 * - platform: 'ios' | 'android' | 'windows' | 'macos' | 'linux' | 'unknown'
 */
export const getDeviceInfo = (): DeviceInfo => {
  // 이미 계산했으면 캐시된 값 반환 (성능 최적화)
  if (cachedDeviceInfo) {
    return cachedDeviceInfo;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as any).deviceMemory || 4;

  // 모바일/태블릿 감지
  const isMobile = /android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|android/i.test(userAgent) && window.innerWidth >= 768;

  // 성능 등급 판단
  const isLowEnd = cores <= 2 || memory < 3;

  // 디바이스 타입 결정
  let deviceType: DeviceInfo['deviceType'];
  if (isTablet) {
    deviceType = 'tablet';
  } else if (isMobile) {
    deviceType = 'mobile';
  } else {
    deviceType = 'desktop';
  }

  // 플랫폼 감지
  let platform: DeviceInfo['platform'];
  if (/iphone|ipad|ipod/i.test(userAgent)) {
    platform = 'ios';
  } else if (/android/i.test(userAgent)) {
    platform = 'android';
  } else if (/windows/i.test(userAgent)) {
    platform = 'windows';
  } else if (/mac os/i.test(userAgent)) {
    platform = 'macos';
  } else if (/linux/i.test(userAgent)) {
    platform = 'linux';
  } else {
    platform = 'unknown';
  }

  cachedDeviceInfo = {
    isMobile,
    isTablet,
    isLowEnd,
    cores,
    memory,
    deviceType,
    platform,
  };

  return cachedDeviceInfo;
};

// 개별 체크 함수들 (편의성)
export const isMobile = (): boolean => getDeviceInfo().isMobile;
export const isTablet = (): boolean => getDeviceInfo().isTablet;
export const isDesktop = (): boolean => getDeviceInfo().deviceType === 'desktop';
export const isLowEndDevice = (): boolean => getDeviceInfo().isLowEnd;
export const isIOS = (): boolean => getDeviceInfo().platform === 'ios';
export const isAndroid = (): boolean => getDeviceInfo().platform === 'android';

// 성능 등급별 분류
export const getPerformanceTier = (): 'low' | 'mid' | 'high' => {
  const { cores, memory, isLowEnd } = getDeviceInfo();

  if (isLowEnd) return 'low';
  if (cores >= 8 && memory >= 8) return 'high';
  return 'mid';
};

// 디버깅용 정보 출력
export const logDeviceInfo = (): void => {
  const info = getDeviceInfo();
  const tier = getPerformanceTier();

  console.log(`
📱 Device Information:
├── Type: ${info.deviceType} ${info.isLowEnd ? '(Low-end)' : ''}
├── Platform: ${info.platform}
├── Performance: ${tier} tier
├── CPU Cores: ${info.cores}
├── Memory: ${info.memory}GB
├── Screen: ${window.innerWidth}x${window.innerHeight}
└── User Agent: ${navigator.userAgent}
  `);
};
