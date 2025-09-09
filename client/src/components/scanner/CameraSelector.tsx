import React from 'react';

interface CameraDevice {
  deviceId: string;
  label: string;
}

interface CameraSelectorProps {
  cameras: CameraDevice[];
  selectedCamera: string;
  onCameraChange: (deviceId: string) => void;
  disabled?: boolean;
}

/**
 * 카메라 선택 컴포넌트
 * @param param0 카메라 목록, 선택된 카메라, 카메라 변경 핸들러, 비활성화 여부
 * @returns JSX.Element | null
 */
export const CameraSelector: React.FC<CameraSelectorProps> = ({
  cameras,
  selectedCamera,
  onCameraChange,
  disabled = false,
}) => {
  if (cameras.length <= 1) return null;

  return (
    <div className="mb-4">
      <select
        value={selectedCamera}
        onChange={(e) => onCameraChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
      >
        {cameras.map((camera) => (
          <option key={camera.deviceId} value={camera.deviceId}>
            {camera.label}
          </option>
        ))}
      </select>
    </div>
  );
};
