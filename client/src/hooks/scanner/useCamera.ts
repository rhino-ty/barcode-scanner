import { useState, useEffect, useCallback } from 'react';

interface CameraDevice {
  deviceId: string;
  label: string;
}

interface UseCameraReturn {
  cameras: CameraDevice[];
  selectedCamera: string;
  setSelectedCamera: (deviceId: string) => void;
  loadCameras: () => Promise<void>;
  isLoading: boolean;
  error: string;
}

export const useCamera = (): UseCameraReturn => {
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const findBestCamera = useCallback((devices: CameraDevice[]): CameraDevice => {
    const backCamera = devices.find((camera) => {
      const label = camera.label.toLowerCase();
      return (
        label.includes('back') ||
        label.includes('rear') ||
        label.includes('environment') ||
        label.includes('후면') ||
        label.includes('main') ||
        label.includes('camera 0') ||
        (!label.includes('front') && !label.includes('user') && !label.includes('전면'))
      );
    });

    return backCamera || devices[devices.length - 1] || devices[0];
  }, []);

  const loadCameras = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      // 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
      });
      stream.getTracks().forEach((track) => track.stop());

      // 디바이스 목록 가져오기
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter((device) => device.kind === 'videoinput')
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `카메라 ${index + 1}`,
        }));

      setCameras(videoDevices);

      if (videoDevices.length > 0) {
        const bestCamera = findBestCamera(videoDevices);
        setSelectedCamera(bestCamera.deviceId);
      }
    } catch (err) {
      console.error('카메라 로드 실패:', err);
      setError('카메라 접근 권한이 필요합니다. 브라우저 설정에서 카메라 권한을 허용해주세요.');
    } finally {
      setIsLoading(false);
    }
  }, [findBestCamera]);

  useEffect(() => {
    loadCameras();
  }, [loadCameras]);

  return {
    cameras,
    selectedCamera,
    setSelectedCamera,
    loadCameras,
    isLoading,
    error,
  };
};
