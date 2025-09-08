import { type RecentActivity } from '@/api/admin';

interface ActivityCardsProps {
  activities?: RecentActivity;
}

export const ActivityCards = ({ activities }: ActivityCardsProps) => {
  const recentLogins =
    activities?.recentLogins?.slice(0, 5).map((log) => ({
      user: log.username || 'Unknown',
      detail: log.teamName || 'No Team',
      time: new Date(log.loginAt).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: log.loginStatus,
    })) || [];

  const recentScans =
    activities?.recentScans?.slice(0, 5).map((scan) => ({
      user: scan.username || 'Unknown',
      detail: scan.scannedBarcode,
      time: new Date(scan.scannedAt).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: scan.scanResult,
    })) || [];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ActivityCard title="최근 로그인" data={recentLogins} />
      <ActivityCard title="최근 스캔" data={recentScans} />
    </div>
  );
};

interface ActivityCardProps {
  title: string;
  data: Array<{
    user: string;
    detail: string;
    time: string;
    status: string;
  }>;
}

const ActivityCard = ({ title, data }: ActivityCardProps) => (
  <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
    <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
    <div className="space-y-3">
      {data.length > 0 ? (
        data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StatusDot status={item.status} />
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">{item.user}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{item.detail}</div>
              </div>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">{item.time}</span>
          </div>
        ))
      ) : (
        <div className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">데이터가 없습니다</div>
      )}
    </div>
  </div>
);

const StatusDot = ({ status }: { status: string }) => {
  const getColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'locked':
        return 'bg-yellow-500';
      default:
        return 'bg-slate-500';
    }
  };

  return <div className={`h-2 w-2 rounded-full ${getColor(status)}`} />;
};
