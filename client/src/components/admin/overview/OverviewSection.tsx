import { useAdminStats, useRecentActivities } from '@/hooks/admin/useAdmin';
import { LoadingSpinner } from '@/components/Loading';
import { StatsCards } from './StatsCards';
import { ActivityCards } from './ActivityCards';
import { SystemStatus } from './SystemStatus';

export const OverviewSection = () => {
  const { data: stats, isLoading: statsLoading, error: statsError } = useAdminStats();
  const { data: activities, isLoading: activitiesLoading, error: activitiesError } = useRecentActivities(5);

  // 로딩 상태
  if (statsLoading || activitiesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 에러 상태
  if (statsError || activitiesError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/30">
        <p className="text-red-700 dark:text-red-400">
          데이터를 불러오는 중 오류가 발생했습니다. 새로고침 버튼을 눌러주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsCards stats={stats} />
      <ActivityCards activities={activities} />
      <SystemStatus />
    </div>
  );
};
