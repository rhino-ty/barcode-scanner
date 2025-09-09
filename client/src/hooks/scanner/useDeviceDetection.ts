import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isLowEnd: boolean;
  cores: number;
  memory: number;
}

/**
 * 디바이스의 특성을 감지하는 커스텀 훅입니다.
 *
 * @returns DeviceInfo 객체를 반환합니다.
 * - isMobile: 모바일 기기 여부
 * - isTablet: 태블릿 기기 여부
 * - isLowEnd: 저사양 기기 여부 (코어 수 2 이하 또는 메모리 3GB 미만)
 * - cores: CPU 코어 수
 * - memory: 기기 메모리 (GB 단위)
 */
export const useDeviceDetection = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isLowEnd: false,
    cores: 4,
    memory: 4,
  });

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android/i.test(userAgent) && window.innerWidth >= 768;
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4;
    const isLowEnd = cores <= 2 || memory < 3;

    setDeviceInfo({
      isMobile,
      isTablet,
      isLowEnd,
      cores,
      memory,
    });
  }, []);

  return deviceInfo;
};
