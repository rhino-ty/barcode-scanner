import { useState, useEffect } from 'react';

interface UseQuaggaLoadReturn {
  isLibraryLoading: boolean;
  loadError: string;
}

/**
 * Quagga 라이브러리를 동적으로 로드
 * @returns Quagga 라이브러리 로드 상태 및 에러 메시지
 * - isLibraryLoading: 라이브러리 로드 중 여부
 * - loadError: 로드 실패 시 에러 메시지
 */
export const useQuaggaLoad = (): UseQuaggaLoadReturn => {
  const [isLibraryLoading, setIsLibraryLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const startLoadingQuagga = async () => {
      if (typeof window === 'undefined') return;

      try {
        const QuaggaModule = await import('@ericblade/quagga2');
        (window as any).Quagga = QuaggaModule.default;

        setIsLibraryLoading(false);
      } catch (err) {
        console.error('Quagga 라이브러리 로드 실패:', err);
        setLoadError('바코드 스캐너 라이브러리를 로드할 수 없습니다.');
        setIsLibraryLoading(false);
      }
    };

    startLoadingQuagga();
  }, []);

  return {
    isLibraryLoading,
    loadError,
  };
};
