/**
 * 상태별 UI 컴포넌트입니다. Query 및 페이지 전체 상태(로딩, 에러)를 일관성 있게 표시하기 위해 제작했습니다.
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-indigo-600 border-t-transparent ${sizeClasses[size]} ${className}`}
    ></div>
  );
};

// 페이지 전체 로딩
export const PageLoader: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
    <div className="text-center">
      <LoadingSpinner size="lg" className="mx-auto mb-4" />
    </div>
  </div>
);

// 쿼리 로딩 (컴포넌트 내부용)
export const QueryLoader: React.FC = () => (
  <div className="flex items-center justify-center p-6">
    <div className="text-center">
      <LoadingSpinner className="mx-auto mb-2" />
    </div>
  </div>
);
