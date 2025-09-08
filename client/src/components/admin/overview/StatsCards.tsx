import { type AdminStats } from '@/api/admin';

interface StatsCardsProps {
  stats?: AdminStats;
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <StatCard title="전체 사용자" value={stats?.totalUsers?.toString() || '0'} color="slate" />
      <StatCard title="활성 사용자" value={stats?.activeUsers?.toString() || '0'} color="green" />
      <StatCard title="오늘 로그인" value={stats?.todayLogins?.toString() || '0'} color="blue" />
      <StatCard title="오늘 스캔" value={stats?.todayScans?.toString() || '0'} color="indigo" />
      <StatCard title="성공률" value={`${stats?.successRate || 0}%`} color="emerald" />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  color: 'slate' | 'green' | 'blue' | 'indigo' | 'emerald';
}

const StatCard = ({ title, value, color }: StatCardProps) => {
  const colorClasses = {
    slate: 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  };

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]} border-slate-200 dark:border-slate-700`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-75">{title}</div>
    </div>
  );
};
